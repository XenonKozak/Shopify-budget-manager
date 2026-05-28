using System;
using System.Collections.Generic;

namespace ShopifyBudgetManager.Api.Core.Models
{
    public class TransactionLog
    {
        public int Id { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string OrderName { get; set; } = string.Empty;
        public string Category { get; set; } = "general";
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "PLN";
        public string Status { get; set; } = "ALLOWED"; // ALLOWED / BLOCKED
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relacja jeden-do-wielu
        public ICollection<TransactionLogItem> Items { get; set; } = new List<TransactionLogItem>();
    }
}
