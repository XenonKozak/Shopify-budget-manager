using System;

namespace ShopifyBudgetManager.Api.DTOs
{
    public class ApprovalRequestDto
    {
        public int Id { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string OrderName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? DecisionNote { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DecidedAt { get; set; }
    }

    public class ApprovalDecisionDto
    {
        public string Decision { get; set; } = string.Empty; // Approved, Rejected
        public string? Note { get; set; }
    }
}
