namespace ShopifyBudgetManager.Api.DTOs
{
    public class BudgetLimitDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal MonthlyLimit { get; set; }
        public decimal CurrentSpent { get; set; }
        public string Currency { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class CreateBudgetLimitDto
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal MonthlyLimit { get; set; }
        public string Currency { get; set; } = "PLN";
    }

    public class UpdateBudgetLimitDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal MonthlyLimit { get; set; }
        public bool IsActive { get; set; }
    }
}
