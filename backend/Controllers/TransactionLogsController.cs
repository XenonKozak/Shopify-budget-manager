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
    public class TransactionLogsController : ControllerBase
    {
        private readonly ITransactionLogService _transactionLogService;

        public TransactionLogsController(ITransactionLogService transactionLogService)
        {
            _transactionLogService = transactionLogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionLogDto>>> Get()
        {
            var logs = await _transactionLogService.GetRecentLogsAsync();
            return Ok(logs);
        }
    }
}

