using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Interfaces
{
    public interface IShopifyWebhookService
    {
        Task<bool> ProcessOrderAsync(string rawBody, string shopDomain, string accessToken);
    }
}
