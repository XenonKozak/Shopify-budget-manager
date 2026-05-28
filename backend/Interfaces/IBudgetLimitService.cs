using System.Collections.Generic;
using System.Threading.Tasks;
using ShopifyBudgetManager.Api.DTOs;

namespace ShopifyBudgetManager.Api.Interfaces
{
    public interface IBudgetLimitService
    {
        Task<IEnumerable<BudgetLimitDto>> GetAllAsync();
        Task<BudgetLimitDto> GetByIdAsync(int id);
        Task<BudgetLimitDto> CreateAsync(CreateBudgetLimitDto dto);
        Task<BudgetLimitDto> UpdateAsync(int id, UpdateBudgetLimitDto dto);
        Task DeleteAsync(int id);
    }
}
