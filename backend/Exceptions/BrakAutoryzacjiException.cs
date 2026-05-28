namespace ShopifyBudgetManager.Api.Exceptions
{
    public class BrakAutoryzacjiException : CustomException
    {
        public BrakAutoryzacjiException()
            : base("Błędny login lub hasło.", 401)
        {
        }
    }
}
