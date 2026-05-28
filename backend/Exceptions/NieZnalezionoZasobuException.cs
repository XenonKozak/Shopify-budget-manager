namespace ShopifyBudgetManager.Api.Exceptions
{
    public class NieZnalezionoZasobuException : CustomException
    {
        public NieZnalezionoZasobuException(string resource)
            : base($"Nie znaleziono: {resource}.", 404)
        {
        }
    }
}
