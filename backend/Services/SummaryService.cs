using Microsoft.EntityFrameworkCore;
using ShopifyBudgetManager.Api.DTOs;
using ShopifyBudgetManager.Api.Interfaces;
using ShopifyBudgetManager.Api.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Services
{
    public class SummaryService : ISummaryService
    {
        private readonly AppDbContext _context;

        public SummaryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SummaryDto> GetSummaryAsync()
        {
            var activeBudgets = await _context.BudgetLimits
                .Where(b => b.IsActive)
                .ToListAsync();

            var totalSpent = activeBudgets.Sum(b => b.CurrentSpent);
            var categoriesCount = activeBudgets.Count;

            var globalBudgetSetting = await _context.GlobalSettings.FirstOrDefaultAsync(s => s.Key == "TotalMonthlyBudget");
            decimal totalMonthlyBudget = 0;
            if (globalBudgetSetting != null && decimal.TryParse(globalBudgetSetting.Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var parsedValue))
            {
                totalMonthlyBudget = parsedValue;
            }

            var remainingBudget = Math.Max(0, totalMonthlyBudget - totalSpent);

            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var blockedPurchasesCount = await _context.TransactionLogs
                .Where(t => t.Status == "BLOCKED" && t.CreatedAt >= startOfMonth)
                .CountAsync();

            var pendingApprovalsCount = await _context.ApprovalRequests
                .Where(a => a.Status == "Pending")
                .CountAsync();

            var unreadNotificationsCount = await _context.Notifications
                .Where(n => !n.IsRead)
                .CountAsync();

            // Dane do wykresu kołowego - wydatki per kategoria
            var categorySpendings = activeBudgets.Select(b => new CategorySpendingDto
            {
                Category = b.Name,
                Amount = b.CurrentSpent,
                Limit = b.MonthlyLimit
            }).ToList();

            // Dane do wykresu liniowego - wydatki dzienne w bieżącym miesiącu
            var dailySpendingsData = await _context.TransactionLogs
                .Where(t => t.CreatedAt >= startOfMonth && t.Status == "ALLOWED")
                .GroupBy(t => t.CreatedAt.Date)
                .Select(g => new 
                {
                    Date = g.Key,
                    Amount = g.Sum(t => t.Amount)
                })
                .OrderBy(d => d.Date)
                .ToListAsync();

            var dailySpendings = dailySpendingsData.Select(d => new DailySpendingDto
            {
                Date = d.Date.ToString("yyyy-MM-dd"),
                Amount = d.Amount
            }).ToList();

            return new SummaryDto
            {
                TotalMonthlyBudget = totalMonthlyBudget,
                TotalSpent = totalSpent,
                RemainingBudget = remainingBudget,
                BudgetCategoriesCount = categoriesCount,
                BlockedPurchasesCount = blockedPurchasesCount,
                PendingApprovalsCount = pendingApprovalsCount,
                UnreadNotificationsCount = unreadNotificationsCount,
                Currency = "PLN",
                CategorySpendings = categorySpendings,
                DailySpendings = dailySpendings
            };
        }
    }
}

