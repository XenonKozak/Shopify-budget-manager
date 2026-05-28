using System;

namespace ShopifyBudgetManager.Api.Core.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        // Typ powiadomienia: BudgetExceeded, BudgetWarning, UnusualSpending, ApprovalRequired
        public string Type { get; set; } = "BudgetWarning";
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        // Opcjonalne powiązanie z użytkownikiem
        public int? UserId { get; set; }
        public User? User { get; set; }
    }
}
