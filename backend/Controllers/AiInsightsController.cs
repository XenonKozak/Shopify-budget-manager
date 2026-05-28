using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopifyBudgetManager.Api.Services;
using ShopifyBudgetManager.Api.Interfaces;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AiInsightsController : ControllerBase
    {
        private readonly IAiInsightsService _aiInsightsService;

        public AiInsightsController(IAiInsightsService aiInsightsService)
        {
            _aiInsightsService = aiInsightsService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var insight = await _aiInsightsService.GetInsightsAsync();
            return Ok(new { text = insight });
        }
    }
}

