using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopifyBudgetManager.Api.Core.Models;
using ShopifyBudgetManager.Api.DTOs;
using ShopifyBudgetManager.Api.Data;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SettingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("global-budget")]
        public async Task<ActionResult<UpdateGlobalBudgetDto>> GetGlobalBudget()
        {
            var setting = await _context.GlobalSettings.FirstOrDefaultAsync(s => s.Key == "TotalMonthlyBudget");
            decimal budget = 0;
            if (setting != null && decimal.TryParse(setting.Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var parsed))
            {
                budget = parsed;
            }
            return Ok(new UpdateGlobalBudgetDto { TotalMonthlyBudget = budget });
        }

        [HttpPut("global-budget")]
        public async Task<IActionResult> UpdateGlobalBudget([FromBody] UpdateGlobalBudgetDto dto)
        {
            var setting = await _context.GlobalSettings.FirstOrDefaultAsync(s => s.Key == "TotalMonthlyBudget");
            if (setting == null)
            {
                setting = new GlobalSetting { Key = "TotalMonthlyBudget", Value = dto.TotalMonthlyBudget.ToString(System.Globalization.CultureInfo.InvariantCulture) };
                _context.GlobalSettings.Add(setting);
            }
            else
            {
                setting.Value = dto.TotalMonthlyBudget.ToString(System.Globalization.CultureInfo.InvariantCulture);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Globalny budżet został zaktualizowany." });
        }
    }
}

