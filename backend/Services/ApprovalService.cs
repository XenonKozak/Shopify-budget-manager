using Microsoft.EntityFrameworkCore;
using ShopifyBudgetManager.Api.Core.Models;
using ShopifyBudgetManager.Api.DTOs;
using ShopifyBudgetManager.Api.Interfaces;
using ShopifyBudgetManager.Api.Exceptions;
using ShopifyBudgetManager.Api.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Services
{
    public class ApprovalService : IApprovalService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;

        public ApprovalService(AppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<ApprovalRequestDto>> GetAllAsync()
        {
            var requests = await _context.ApprovalRequests
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return requests.Select(MapToDto);
        }

        public async Task<IEnumerable<ApprovalRequestDto>> GetPendingAsync()
        {
            var requests = await _context.ApprovalRequests
                .Where(a => a.Status == "Pending")
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return requests.Select(MapToDto);
        }

        public async Task<ApprovalRequestDto> MakeDecisionAsync(int id, ApprovalDecisionDto dto)
        {
            var request = await _context.ApprovalRequests.FindAsync(id);
            if (request == null)
            {
                throw new NieZnalezionoZasobuException("ApprovalRequest");
            }

            if (request.Status != "Pending")
            {
                throw new NieprawidloweDaneException("To żądanie zatwierdzenia zostało już rozpatrzone.");
            }

            request.Status = dto.Decision; // Approved / Rejected
            request.DecisionNote = dto.Note;
            request.DecidedAt = DateTime.UtcNow;

            // Dodaj audit log
            _context.AuditLogs.Add(new AuditLog
            {
                Action = $"ApprovalDecision:{dto.Decision}",
                EntityType = "ApprovalRequest",
                EntityId = id.ToString(),
                Details = $"Zamówienie {request.OrderName} ({request.Amount} {request.Currency}) - decyzja: {dto.Decision}. {dto.Note}"
            });

            // Powiadomienie
            await _notificationService.CreateAsync(
                $"Decyzja: {dto.Decision}",
                $"Zamówienie {request.OrderName} na kwotę {request.Amount} {request.Currency} zostało {(dto.Decision == "Approved" ? "zaakceptowane" : "odrzucone")}.",
                "ApprovalDecision"
            );

            await _context.SaveChangesAsync();
            return MapToDto(request);
        }

        private ApprovalRequestDto MapToDto(ApprovalRequest r)
        {
            return new ApprovalRequestDto
            {
                Id = r.Id,
                OrderId = r.OrderId,
                OrderName = r.OrderName,
                Amount = r.Amount,
                Currency = r.Currency,
                Category = r.Category,
                Status = r.Status,
                DecisionNote = r.DecisionNote,
                CreatedAt = r.CreatedAt,
                DecidedAt = r.DecidedAt
            };
        }
    }
}

