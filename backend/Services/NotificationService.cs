using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShopifyBudgetManager.Api.Core.Models;
using ShopifyBudgetManager.Api.DTOs;
using ShopifyBudgetManager.Api.Interfaces;
using ShopifyBudgetManager.Api.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NotificationDto>> GetAllAsync()
        {
            var notifications = await _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();

            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            });
        }

        public async Task<int> GetUnreadCountAsync()
        {
            return await _context.Notifications.CountAsync(n => !n.IsRead);
        }

        public async Task MarkAsReadAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification != null)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync()
        {
            var unread = await _context.Notifications.Where(n => !n.IsRead).ToListAsync();
            foreach (var n in unread)
            {
                n.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }

        public async Task CreateAsync(string title, string message, string type)
        {
            var notification = new Notification
            {
                Title = title,
                Message = message,
                Type = type
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }
    }
}

