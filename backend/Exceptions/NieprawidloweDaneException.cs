namespace ShopifyBudgetManager.Api.Exceptions
{
    public class NieprawidloweDaneException : CustomException
    {
        public NieprawidloweDaneException(string message)
            : base(message, 400)
        {
        }
    }
}
