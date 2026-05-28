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
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var logs = await _auditLogService.GetRecentAsync();
            return Ok(logs);
        }
    }
}

