using System;

namespace ShopifyBudgetManager.Api.Core.Models
{
    public class ApprovalRequest
    {
        public int Id { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string OrderName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "PLN";
        public string Category { get; set; } = string.Empty;
        // Status: Pending, Approved, Rejected
        public string Status { get; set; } = "Pending";
        public string? DecisionNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DecidedAt { get; set; }
        // Kto podjął decyzję (admin)
        public int? DecidedByUserId { get; set; }
        public User? DecidedByUser { get; set; }
        // Powiązanie z logiem transakcji
        public int? TransactionLogId { get; set; }
        public TransactionLog? TransactionLog { get; set; }
    }
}
