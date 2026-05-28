using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace ShopifyBudgetManager.Api.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Wystąpił błąd podczas przetwarzania żądania.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var statusCode = StatusCodes.Status500InternalServerError;
            var message = "Wystąpił błąd serwera.";

            if (exception is Exceptions.CustomException customEx)
            {
                statusCode = customEx.StatusCode;
                message = customEx.Message;
            }

            response.StatusCode = statusCode;

            var result = JsonSerializer.Serialize(new { error = message });
            return response.WriteAsync(result);
        }
    }
}
