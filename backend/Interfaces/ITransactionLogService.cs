using System.Collections.Generic;
using System.Threading.Tasks;
using ShopifyBudgetManager.Api.DTOs;

namespace ShopifyBudgetManager.Api.Interfaces
{
    public interface ITransactionLogService
    {
        Task<IEnumerable<TransactionLogDto>> GetRecentLogsAsync(int count = 50);
    }
}
