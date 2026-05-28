using ShopifyBudgetManager.Api.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Interfaces
{
    public interface IApprovalService
    {
        Task<IEnumerable<ApprovalRequestDto>> GetAllAsync();
        Task<IEnumerable<ApprovalRequestDto>> GetPendingAsync();
        Task<ApprovalRequestDto> MakeDecisionAsync(int id, ApprovalDecisionDto dto);
    }
}
