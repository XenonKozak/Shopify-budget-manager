using System.Collections.Generic;

namespace ShopifyBudgetManager.Api.DTOs
{
    public class SummaryDto
    {
        public decimal TotalMonthlyBudget { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal RemainingBudget { get; set; }
        public int BudgetCategoriesCount { get; set; }
        public int BlockedPurchasesCount { get; set; }
        public int PendingApprovalsCount { get; set; }
        public int UnreadNotificationsCount { get; set; }
        public string Currency { get; set; } = "PLN";

        // Dane do wykresów
        public IEnumerable<CategorySpendingDto> CategorySpendings { get; set; } = new List<CategorySpendingDto>();
        public IEnumerable<DailySpendingDto> DailySpendings { get; set; } = new List<DailySpendingDto>();
    }

    public class CategorySpendingDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Limit { get; set; }
    }

    public class DailySpendingDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
