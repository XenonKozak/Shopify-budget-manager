using AutoMapper;
using ShopifyBudgetManager.Api.Core.Models;
using ShopifyBudgetManager.Api.DTOs;

namespace ShopifyBudgetManager.Api.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<BudgetLimit, BudgetLimitDto>();
            CreateMap<CreateBudgetLimitDto, BudgetLimit>();
            CreateMap<TransactionLog, TransactionLogDto>();
            CreateMap<TransactionLogItem, TransactionLogItemDto>();
        }
    }
}
