using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ShopifyBudgetManager.Api.Core.Models;
using ShopifyBudgetManager.Api.DTOs;
using ShopifyBudgetManager.Api.Interfaces;
using ShopifyBudgetManager.Api.Exceptions;
using ShopifyBudgetManager.Api.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Services
{
    public class BudgetLimitService : IBudgetLimitService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public BudgetLimitService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<BudgetLimitDto>> GetAllAsync()
        {
            var limits = await _context.BudgetLimits.ToListAsync();
            return _mapper.Map<IEnumerable<BudgetLimitDto>>(limits);
        }

        public async Task<BudgetLimitDto> GetByIdAsync(int id)
        {
            var limit = await _context.BudgetLimits.FindAsync(id);
            if (limit == null)
            {
                throw new NieZnalezionoZasobuException("BudgetLimit");
            }

            return _mapper.Map<BudgetLimitDto>(limit);
        }

        public async Task<BudgetLimitDto> CreateAsync(CreateBudgetLimitDto dto)
        {
            var exists = await _context.BudgetLimits.AnyAsync(b => b.Category == dto.Category);
            if (exists)
            {
                throw new NieprawidloweDaneException($"Budżet dla kategorii '{dto.Category}' już istnieje.");
            }

            var limit = _mapper.Map<BudgetLimit>(dto);
            _context.BudgetLimits.Add(limit);
            await _context.SaveChangesAsync();

            return _mapper.Map<BudgetLimitDto>(limit);
        }

        public async Task<BudgetLimitDto> UpdateAsync(int id, UpdateBudgetLimitDto dto)
        {
            var limit = await _context.BudgetLimits.FindAsync(id);
            if (limit == null)
            {
                throw new NieZnalezionoZasobuException("BudgetLimit");
            }

            limit.Name = dto.Name;
            limit.MonthlyLimit = dto.MonthlyLimit;
            limit.IsActive = dto.IsActive;
            limit.UpdatedAt = System.DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return _mapper.Map<BudgetLimitDto>(limit);
        }

        public async Task DeleteAsync(int id)
        {
            var limit = await _context.BudgetLimits.FindAsync(id);
            if (limit == null)
            {
                throw new NieZnalezionoZasobuException("BudgetLimit");
            }

            _context.BudgetLimits.Remove(limit);
            await _context.SaveChangesAsync();
        }
    }
}

