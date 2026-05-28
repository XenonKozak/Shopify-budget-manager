using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ShopifyBudgetManager.Api.Core.Models;
using ShopifyBudgetManager.Api.Data;
using System;
using ShopifyBudgetManager.Api.Interfaces;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Services
{
    public class ShopifyWebhookService : IShopifyWebhookService
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ShopifyWebhookService> _logger;

        public ShopifyWebhookService(AppDbContext context, IHttpClientFactory httpClientFactory, ILogger<ShopifyWebhookService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<bool> ProcessOrderAsync(string rawBody, string shopDomain, string accessToken)
        {
            try
            {
                using var document = JsonDocument.Parse(rawBody);
                var root = document.RootElement;

                var orderId = root.GetProperty("id").GetInt64().ToString();
                var orderName = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? $"#{orderId}" : $"#{orderId}";
                var amount = decimal.Parse(root.GetProperty("total_price").GetString() ?? "0", System.Globalization.CultureInfo.InvariantCulture);
                var currency = root.GetProperty("currency").GetString() ?? "PLN";

                var lineItems = root.GetProperty("line_items");
                var transactionItems = new List<TransactionLogItem>();

                foreach (var item in lineItems.EnumerateArray())
                {
                    var productId = item.TryGetProperty("product_id", out var pId) && pId.ValueKind != JsonValueKind.Null ? pId.GetInt64().ToString() : "unknown";
                    var itemName = item.TryGetProperty("name", out var iname) ? iname.GetString() : "Unknown Product";
                    var quantity = item.TryGetProperty("quantity", out var q) ? q.GetInt32() : 1;
                    var price = decimal.Parse(item.TryGetProperty("price", out var p) ? p.GetString() ?? "0" : "0", System.Globalization.CultureInfo.InvariantCulture);

                    transactionItems.Add(new TransactionLogItem
                    {
                        Name = itemName ?? "Unknown",
                        Quantity = quantity,
                        Price = price,
                        ProductId = productId,
                        ProductUrl = productId != "unknown" ? $"https://{shopDomain}/admin/products/{productId}" : null
                    });
                }

                var category = "general";
                var limitRecord = await _context.BudgetLimits.FirstOrDefaultAsync(b => b.Category == category && b.IsActive);
                
                if (limitRecord == null)
                {
                    limitRecord = await _context.BudgetLimits.FirstOrDefaultAsync(b => b.IsActive);
                }

                // Audit log - webhook odebrany
                _context.AuditLogs.Add(new AuditLog
                {
                    Action = "WebhookReceived",
                    EntityType = "Order",
                    EntityId = orderId,
                    Details = $"Odebrano webhook dla zamówienia {orderName}, kwota: {amount} {currency}"
                });

                if (limitRecord == null)
                {
                    var untrackedLog = new TransactionLog
                    {
                        OrderId = orderId,
                        OrderName = orderName,
                        Category = "untracked",
                        Amount = amount,
                        Currency = currency,
                        Status = "ALLOWED",
                        Reason = "Brak aktywnych budżetów",
                        Items = transactionItems
                    };
                    _context.TransactionLogs.Add(untrackedLog);
                    await _context.SaveChangesAsync();
                    return true;
                }

                var newSpent = limitRecord.CurrentSpent + amount;

                // Sprawdzenie progu ostrzeżenia (80%)
                var warningThreshold = limitRecord.MonthlyLimit * 0.8m;
                if (limitRecord.CurrentSpent < warningThreshold && newSpent >= warningThreshold && newSpent <= limitRecord.MonthlyLimit)
                {
                    _context.Notifications.Add(new Notification
                    {
                        Title = "Zbliżasz się do limitu!",
                        Message = $"Kategoria \"{limitRecord.Name}\" osiągnęła {(newSpent / limitRecord.MonthlyLimit * 100):F0}% limitu ({newSpent} / {limitRecord.MonthlyLimit} {currency}).",
                        Type = "BudgetWarning"
                    });
                }

                if (newSpent > limitRecord.MonthlyLimit)
                {
                    var blockedLog = new TransactionLog
                    {
                        OrderId = orderId,
                        OrderName = orderName,
                        Category = limitRecord.Category,
                        Amount = amount,
                        Currency = currency,
                        Status = "BLOCKED",
                        Reason = $"Przekroczono limit. Zamówienie na {amount} {currency} powoduje wydatki {newSpent} (Limit: {limitRecord.MonthlyLimit})",
                        Items = transactionItems
                    };
                    _context.TransactionLogs.Add(blockedLog);

                    // Tworzenie ApprovalRequest
                    _context.ApprovalRequests.Add(new ApprovalRequest
                    {
                        OrderId = orderId,
                        OrderName = orderName,
                        Amount = amount,
                        Currency = currency,
                        Category = limitRecord.Category,
                        Status = "Pending"
                    });

                    // Powiadomienie o przekroczeniu
                    _context.Notifications.Add(new Notification
                    {
                        Title = "Budżet przekroczony!",
                        Message = $"Zamówienie {orderName} na kwotę {amount} {currency} przekroczyło limit kategorii \"{limitRecord.Name}\". Wymaga zatwierdzenia administratora.",
                        Type = "BudgetExceeded"
                    });

                    await _context.SaveChangesAsync();

                    await CancelShopifyOrderAsync(orderId, "Przekroczono osobisty limit wydatków.", shopDomain, accessToken);
                    return false;
                }
                else
                {
                    limitRecord.CurrentSpent = newSpent;
                    
                    var allowedLog = new TransactionLog
                    {
                        OrderId = orderId,
                        OrderName = orderName,
                        Category = limitRecord.Category,
                        Amount = amount,
                        Currency = currency,
                        Status = "ALLOWED",
                        Items = transactionItems
                    };
                    _context.TransactionLogs.Add(allowedLog);
                    await _context.SaveChangesAsync();
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd przetwarzania zamówienia z webhooka Shopify.");
                throw;
            }
        }

        private async Task CancelShopifyOrderAsync(string orderId, string reasonDetails, string shopDomain, string accessToken)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("X-Shopify-Access-Token", accessToken);

                var content = new StringContent(
                    JsonSerializer.Serialize(new { email = true, note = reasonDetails }),
                    Encoding.UTF8,
                    "application/json");

                var url = $"https://{shopDomain}/admin/api/2024-01/orders/{orderId}/cancel.json";
                var response = await client.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Błąd anulowania zamówienia {orderId} w Shopify: {error}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd sieci podczas anulowania zamówienia w Shopify.");
            }
        }
    }
}

