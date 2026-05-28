using ShopifyBudgetManager.Api.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Interfaces
{
    public interface IAuditLogService
    {
        Task<IEnumerable<AuditLogDto>> GetRecentAsync(int count = 100);
        Task LogAsync(string action, string entityType, string? entityId = null, string? details = null, string? userEmail = null);
    }
}
