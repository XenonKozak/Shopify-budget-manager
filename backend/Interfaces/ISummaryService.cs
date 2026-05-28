using System.Threading.Tasks;
using ShopifyBudgetManager.Api.DTOs;

namespace ShopifyBudgetManager.Api.Interfaces
{
    public interface ISummaryService
    {
        Task<SummaryDto> GetSummaryAsync();
    }
}
