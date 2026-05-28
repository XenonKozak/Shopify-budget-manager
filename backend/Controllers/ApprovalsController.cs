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
    public class ApprovalsController : ControllerBase
    {
        private readonly IApprovalService _approvalService;

        public ApprovalsController(IApprovalService approvalService)
        {
            _approvalService = approvalService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var requests = await _approvalService.GetAllAsync();
            return Ok(requests);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var requests = await _approvalService.GetPendingAsync();
            return Ok(requests);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/decision")]
        public async Task<IActionResult> MakeDecision(int id, [FromBody] ApprovalDecisionDto dto)
        {
            var result = await _approvalService.MakeDecisionAsync(id, dto);
            return Ok(result);
        }
    }
}

