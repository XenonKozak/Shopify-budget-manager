using ShopifyBudgetManager.Api.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetAllAsync();
        Task<int> GetUnreadCountAsync();
        Task MarkAsReadAsync(int id);
        Task MarkAllAsReadAsync();
        Task CreateAsync(string title, string message, string type);
    }
}
