using System;
using System.Collections.Generic;

namespace ShopifyBudgetManager.Api.DTOs
{
    public class TransactionLogDto
    {
        public int Id { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string OrderName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; }

        public IEnumerable<TransactionLogItemDto> Items { get; set; } = new List<TransactionLogItemDto>();
    }

    public class TransactionLogItemDto
    {
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string ProductId { get; set; } = string.Empty;
        public string? Image { get; set; }
        public string? ProductUrl { get; set; }
    }
}
