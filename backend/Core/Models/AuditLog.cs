using System;

namespace ShopifyBudgetManager.Api.Core.Models
{
    public class AuditLog
    {
        public int Id { get; set; }

        // Typ akcji: BudgetCreated, BudgetUpdated, BudgetDeleted, ApprovalDecision, UserLogin, WebhookReceived
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string? Details { get; set; }
        public string? UserEmail { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
