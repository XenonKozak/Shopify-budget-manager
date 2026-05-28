using System;

namespace ShopifyBudgetManager.Api.Core.Models
{
    public class BudgetLimit
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal MonthlyLimit { get; set; }
        public decimal CurrentSpent { get; set; }
        public string Currency { get; set; } = "PLN";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
