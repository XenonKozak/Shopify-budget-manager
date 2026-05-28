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
    public class AuditLogService : IAuditLogService
    {
        private readonly AppDbContext _context;

        public AuditLogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AuditLogDto>> GetRecentAsync(int count = 100)
        {
            var logs = await _context.AuditLogs
                .OrderByDescending(l => l.CreatedAt)
                .Take(count)
                .ToListAsync();

            return logs.Select(l => new AuditLogDto
            {
                Id = l.Id,
                Action = l.Action,
                EntityType = l.EntityType,
                EntityId = l.EntityId,
                Details = l.Details,
                UserEmail = l.UserEmail,
                CreatedAt = l.CreatedAt
            });
        }

        public async Task LogAsync(string action, string entityType, string? entityId = null, string? details = null, string? userEmail = null)
        {
            var log = new AuditLog
            {
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details,
                UserEmail = userEmail
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}

