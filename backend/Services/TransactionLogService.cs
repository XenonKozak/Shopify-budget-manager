using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShopifyBudgetManager.Api.DTOs;
using ShopifyBudgetManager.Api.Interfaces;
using ShopifyBudgetManager.Api.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Services
{
    public class TransactionLogService : ITransactionLogService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public TransactionLogService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TransactionLogDto>> GetRecentLogsAsync(int count = 50)
        {
            var logs = await _context.TransactionLogs
                .Include(t => t.Items)
                .OrderByDescending(t => t.CreatedAt)
                .Take(count)
                .ToListAsync();

            return _mapper.Map<IEnumerable<TransactionLogDto>>(logs);
        }
    }
}

