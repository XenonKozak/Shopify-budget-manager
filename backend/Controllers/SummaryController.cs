using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopifyBudgetManager.Api.DTOs;
using ShopifyBudgetManager.Api.Services;
using ShopifyBudgetManager.Api.Interfaces;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SummaryController : ControllerBase
    {
        private readonly ISummaryService _summaryService;

        public SummaryController(ISummaryService summaryService)
        {
            _summaryService = summaryService;
        }

        [HttpGet]
        public async Task<ActionResult<SummaryDto>> Get()
        {
            var summary = await _summaryService.GetSummaryAsync();
            return Ok(summary);
        }
    }
}

