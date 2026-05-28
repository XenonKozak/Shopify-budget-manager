using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using ShopifyBudgetManager.Api.Services;
using ShopifyBudgetManager.Api.Interfaces;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebhooksController : ControllerBase
    {
        private readonly IShopifyWebhookService _webhookService;
        private readonly IConfiguration _configuration;

        public WebhooksController(IShopifyWebhookService webhookService, IConfiguration configuration)
        {
            _webhookService = webhookService;
            _configuration = configuration;
        }

        [HttpPost("orders")]
        public async Task<IActionResult> Orders()
        {
            using var reader = new StreamReader(Request.Body);
            var rawBody = await reader.ReadToEndAsync();

            var hmacHeader = Request.Headers["X-Shopify-Hmac-Sha256"].ToString();
            var apiSecret = _configuration["Shopify:ApiSecret"];
            var shopName = _configuration["Shopify:ShopName"];
            var accessToken = _configuration["Shopify:AccessToken"];

            if (string.IsNullOrEmpty(apiSecret) || string.IsNullOrEmpty(shopName) || string.IsNullOrEmpty(accessToken))
            {
                return StatusCode(500, "Brak konfiguracji Shopify.");
            }

            // HMAC Validation
            if (!string.IsNullOrEmpty(hmacHeader))
            {
                using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(apiSecret));
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody));
                var calculatedHmac = System.Convert.ToBase64String(hash);

                if (calculatedHmac != hmacHeader)
                {
                    return Unauthorized("Nieprawidłowy podpis HMAC.");
                }
            }

            var result = await _webhookService.ProcessOrderAsync(rawBody, shopName, accessToken);

            if (result)
            {
                return Ok(new { message = "Zamówienie zaakceptowane i zaktualizowano budżet." });
            }
            else
            {
                return Ok(new { message = "Zamówienie zablokowane ze względu na limit." });
            }
        }
    }
}

