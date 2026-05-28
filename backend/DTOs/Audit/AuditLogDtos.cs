using System;

namespace ShopifyBudgetManager.Api.DTOs
{
    public class AuditLogDto
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string? Details { get; set; }
        public string? UserEmail { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
