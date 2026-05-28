# Rozdział 2.1: Charakterystyka interfejsów programistycznych (API) platformy Shopify

Poniższa treść stanowi merytoryczną bazę do podrozdziału pracy licencjackiej, opisującą aspekty techniczne i architektoniczne API Shopify, na których opiera się aplikacja Shopify Budget Manager.

---

### 2.1 Charakterystyka interfejsów programistycznych (API) platformy Shopify

Platforma Shopify udostępnia rozbudowany ekosystem interfejsów programistycznych, które umożliwiają zewnętrznym aplikacjom interakcję z danymi sklepu w sposób bezpieczny i ustandaryzowany. W kontekście niniejszego projektu, kluczowe znaczenie mają dwa rodzaje interfejsów: **Admin API** oraz system **Webhooków**.

#### 2.1.1 Shopify Admin API
Shopify Admin API jest głównym kanałem komunikacji służącym do odczytu i zapisu danych wewnątrz panelu administracyjnego sklepu (produkty, zamówienia, klienci). Interfejs ten występuje w dwóch wariantach architektonicznych:

1.  **REST API**: Klasyczne podejście oparte na zasobach (Resources) i standardowych metodach HTTP (GET, POST, PUT, DELETE). Dane przesyłane są w formacie **JSON**. W projekcie wykorzystano ten model m.in. do operacji anulowania zamówień (`POST /orders/{id}/cancel.json`).
2.  **GraphQL API**: Nowoczesna alternatywa pozwalająca na precyzyjne definiowanie struktury zwracanych danych, co minimalizuje problem *over-fetching* (pobierania nadmiarowych danych) oraz *under-fetching* (konieczności wykonywania wielu zapytań).

**Wersjonowanie**: Shopify stosuje cykl wydawniczy oparty na wersjach kwartalnych (np. `2024-01`). Zapewnia to stabilność aplikacji, dając programistom czas na adaptację do zmian w API przed wygaszeniem starszych wersji.

#### 2.1.2 System Webhooków (Mechanizm Push)
Webhooki stanowią fundament asynchronicznej komunikacji między Shopify a zewnętrznym serwerem. Zamiast cyklicznego odpytywania API o nowe dane (polling), Shopify "wypycha" informacje o zdarzeniu natychmiast po jego wystąpieniu.

*   **Zastosowanie w projekcie**: Aplikacja subskrybuje zdarzenie `orders/create`. W momencie złożenia zamówienia przez klienta w sklepie, Shopify wysyła żądanie HTTP POST z pełnym opisem zamówienia w formacie JSON na endpoint `/api/webhooks/orders`.
*   **Weryfikacja autentyczności (HMAC)**: Ze względów bezpieczeństwa każde żądanie webhook zawiera nagłówek `X-Shopify-Hmac-Sha256`. Serwer aplikacji musi wygenerować własny skrót na podstawie treści żądania i klucza współdzielonego (`Client Secret`), a następnie porównać go z otrzymanym nagłówkiem. Gwarantuje to, że dane pochodzą z zaufanego źródła.

#### 2.1.3 Bezpieczeństwo i Autoryzacja
Komunikacja z API odbywa się w oparciu o protokół **OAuth 2.0**. Aplikacje uzyskują tzw. `Access Token` (Offline Access), który jest przesyłany w nagłówku `X-Shopify-Access-Token`. 

Kluczowym elementem są **Zakresy Uprawnień (Scopes)**. System działa zgodnie z zasadą minimalnych uprawnień (*Principle of Least Privilege*). Dla potrzeb aplikacji budżetowej niezbędne są m.in.:
*   `read_orders`: do analizy wartości zakupów.
*   `write_orders`: do możliwości anulowania zamówień przekraczających limit.

#### 2.1.4 Limity przepustowości (Rate Limiting)
Shopify implementuje algorytm **Leaky Bucket** (przeciekającego wiadra) do zarządzania obciążeniem serwerów:
*   Dla REST API standardowy limit to 40 żądań na aplikację na sklep, z "wyciekiem" na poziomie 2 żądań na sekundę.
*   Przekroczenie limitu skutkuje błędem `HTTP 429 Too Many Requests`. 

Zrozumienie tych ograniczeń jest krytyczne przy projektowaniu synchronizacji dużej ilości danych historycznych, co w systemie Budget Manager wymagało zastosowania mechanizmów kolejkowania żądań.

---

**Wskazówka do pisania pracy:**
Warto w tym podrozdziale wspomnieć o tym, dlaczego wybrano konkretną wersję API (np. REST) — najczęściej jest to argumentowane dojrzałością bibliotek (takich jak `ShopifySharp`) lub prostotą implementacji dla konkretnych zadań, takich jak anulowanie zamówienia.
