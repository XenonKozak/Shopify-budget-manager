using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopifyBudgetManager.Api.DTOs;
using ShopifyBudgetManager.Api.Services;
using ShopifyBudgetManager.Api.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetLimitsController : ControllerBase
    {
        private readonly IBudgetLimitService _budgetLimitService;

        public BudgetLimitsController(IBudgetLimitService budgetLimitService)
        {
            _budgetLimitService = budgetLimitService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BudgetLimitDto>>> GetAll()
        {
            var limits = await _budgetLimitService.GetAllAsync();
            return Ok(limits);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BudgetLimitDto>> GetById(int id)
        {
            var limit = await _budgetLimitService.GetByIdAsync(id);
            return Ok(limit);
        }

        [HttpPost]
        public async Task<ActionResult<BudgetLimitDto>> Create([FromBody] CreateBudgetLimitDto dto)
        {
            var created = await _budgetLimitService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<BudgetLimitDto>> Update(int id, [FromBody] UpdateBudgetLimitDto dto)
        {
            var updated = await _budgetLimitService.UpdateAsync(id, dto);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _budgetLimitService.DeleteAsync(id);
            return NoContent();
        }
    }
}

