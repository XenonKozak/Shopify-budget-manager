using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ShopifyBudgetManager.Api.Data;
using System;
using ShopifyBudgetManager.Api.Interfaces;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Services
{
    public class AiInsightsService : IAiInsightsService
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AiInsightsService> _logger;

        public AiInsightsService(AppDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<AiInsightsService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> GetInsightsAsync()
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return "Brak klucza API.";
            }

            var activeBudgets = await _context.BudgetLimits.Where(b => b.IsActive).ToListAsync();
            if (!activeBudgets.Any())
            {
                return "Brak aktywnych budżetów.";
            }

            var globalBudgetSetting = await _context.GlobalSettings.FirstOrDefaultAsync(s => s.Key == "TotalMonthlyBudget");
            var globalBudget = globalBudgetSetting != null ? globalBudgetSetting.Value : "0";

            var daysInMonth = DateTime.DaysInMonth(DateTime.UtcNow.Year, DateTime.UtcNow.Month);
            var currentDay = DateTime.UtcNow.Day;

            var recentLogs = await _context.TransactionLogs
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .ToListAsync();

            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("Jesteś asystentem finansowym. Napisz krótkie podsumowanie i prostą prognozę wydatków (maksymalnie 4 zdania, po polsku).");
            promptBuilder.AppendLine($"Dzisiaj jest {currentDay} dzień miesiąca (miesiąc ma {daysInMonth} dni).");
            promptBuilder.AppendLine($"Globalny budżet na ten miesiąc: {globalBudget} PLN.");
            promptBuilder.AppendLine("Limity kategorii:");
            
            foreach (var budget in activeBudgets)
            {
                promptBuilder.AppendLine($"- Kategoria: {budget.Name} | Limit: {budget.MonthlyLimit} PLN | Wydano: {budget.CurrentSpent} PLN.");
            }

            if (recentLogs.Any())
            {
                promptBuilder.AppendLine("Ostatnie zakupy:");
                foreach (var log in recentLogs)
                {
                    promptBuilder.AppendLine($"- {log.OrderName}: {log.Amount} PLN (Status: {log.Status})");
                }
            }

            var prompt = promptBuilder.ToString();
            
            return await CallGeminiApiAsync(apiKey, prompt);
        }

        private async Task<string> CallGeminiApiAsync(string apiKey, string prompt)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var model = _configuration["Gemini:Model"] ?? "gemini-2.0-flash";

                var payload = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    }
                };

                using var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
                var response = await client.PostAsync(url, content);
                var resultJson = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Błąd API Gemini. Model: {Model}, Status: {StatusCode}, Odpowiedź: {Error}", model, (int)response.StatusCode, resultJson);
                    if ((int)response.StatusCode == 429)
                    {
                        return "Przekroczono limit zapytań. Spróbuj później.";
                    }
                    if ((int)response.StatusCode == 503)
                    {
                        return "Usługa AI jest chwilowo przeciążona.";
                    }

                    if ((int)response.StatusCode == 404)
                    {
                        return "Wybrany model AI jest niedostępny.";
                    }

                    return $"Błąd Gemini API: {(int)response.StatusCode}.";
                }

                using var document = JsonDocument.Parse(resultJson);
                var text = GetTextFromGeminiResponse(document.RootElement);
                if (!string.IsNullOrWhiteSpace(text))
                {
                    return text;
                }

                _logger.LogWarning("Gemini zwróciło odpowiedź bez treści. Payload: {Payload}", resultJson);
                return "Brak odpowiedzi z AI.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Wystąpił wyjątek podczas komunikacji z API Gemini.");
                return "Błąd połączenia z AI.";
            }
        }

        private static string? GetTextFromGeminiResponse(JsonElement root)
        {
            if (!root.TryGetProperty("candidates", out var candidates) || candidates.ValueKind != JsonValueKind.Array || candidates.GetArrayLength() == 0)
            {
                return null;
            }

            var candidate = candidates[0];
            if (!candidate.TryGetProperty("content", out var content))
            {
                return null;
            }

            if (!content.TryGetProperty("parts", out var parts) || parts.ValueKind != JsonValueKind.Array || parts.GetArrayLength() == 0)
            {
                return null;
            }

            var firstPart = parts[0];
            if (!firstPart.TryGetProperty("text", out var textProp))
            {
                return null;
            }

            var value = textProp.GetString();
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return value;
        }
    }
}

