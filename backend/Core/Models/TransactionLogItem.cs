namespace ShopifyBudgetManager.Api.Core.Models
{
    public class TransactionLogItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string ProductId { get; set; } = string.Empty;
        public string? Image { get; set; }
        public string? ProductUrl { get; set; }
        public int TransactionLogId { get; set; }
        public TransactionLog TransactionLog { get; set; } = null!;
    }
}
