using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Interfaces
{
    public interface IAiInsightsService
    {
        Task<string> GetInsightsAsync();
    }
}
