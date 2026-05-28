using System.Threading.Tasks;
using ShopifyBudgetManager.Api.DTOs;

namespace ShopifyBudgetManager.Api.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(UserRegisterDto dto);
        Task<AuthResponseDto> LoginAsync(UserLoginDto dto);
    }
}
