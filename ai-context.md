# 🤖 AI Prompt Context: Shopify Budget Manager

Ten plik służy jako kontekst wejściowy (system prompt / knowledge file) dla dowolnego agenta AI pracującego nad tą aplikacją. Dostarcza on pełny przegląd architektury, technologii, schematu bazy danych, endpointów API oraz standardów kodowania, aby umożliwić bezbłędne rozszerzanie i modyfikowanie projektu.

---

## 📋 1. Przegląd Aplikacji i Cel Biznesowy

**Shopify Budget Manager** to aplikacja webowa e-commerce służąca do kontroli kosztów i zapobiegania niekontrolowanym wydatkom. System integruje się bezpośrednio z Shopify poprzez webhooki i w razie przekroczenia zdefiniowanego limitu kategorii blokuje (anuluje) zamówienie w Shopify, tworząc żądanie zatwierdzenia (**Approval Request**) w systemie dla Administratora. Dodatkowo model **Google Gemini AI** analizuje dane finansowe, generując prognozy kosztów i analizę trendów.

---

## 🛠️ 2. Stos Technologiczny i Środowisko

### Backend (`/backend`)
*   **Platforma:** ASP.NET Core 10.0 Web API
*   **ORM:** Entity Framework Core (SQL Server) - podejście **Code First**
*   **Baza danych:** Microsoft SQL Server (LocalDB pod `(localdb)\mssqllocaldb`)
*   **Uwierzytelnianie:** JWT Bearer (Tokeny ważne 2 godziny, z autoryzacją ról `User` i `Admin`)
*   **Port lokalny:** `http://localhost:5258`
*   **Kluczowe pakiety:** `AutoMapper`, `ShopifySharp`, `Microsoft.EntityFrameworkCore.SqlServer`

### Frontend (`/frontend`)
*   **Framework:** Vue 3 (Composition API: `<script setup>`) z budowaniem przez Vite
*   **Stan:** Pinia (zarządzanie sesją w `auth.js`)
*   **Stylizacja:** Tailwind CSS 4.0
*   **Wykresy:** Chart.js
*   **Klient HTTP:** Axios z automatycznym dodawaniem nagłówka `Authorization: Bearer <token>`
*   **Port lokalny:** `http://localhost:5173`

---

## 🗄️ 3. Schemat Bazy Danych i Encje (`/backend/Core/Models`)

Poniższa tabela przedstawia strukturę bazy danych zarządzaną przez EF Core:

| Encja | Nazwa Tabeli | Kluczowe Pola | Opis |
| :--- | :--- | :--- | :--- |
| `User` | `Users` | `Id` (Int), `Email` (String), `PasswordHash`, `Role` (`Admin`/`User`) | Użytkownicy systemu |
| `BudgetLimit` | `BudgetLimits` | `Id`, `CategoryName`, `CategoryKey` (unikalny), `MonthlyLimit` (Decimal), `SpentAmount` (Decimal), `IsActive` (Bool) | Limity wydatków per kategoria |
| `GlobalSetting` | `GlobalSettings` | `Id`, `Key` (String), `Value` (String) | Konfiguracja globalna (np. całkowity budżet miesięczny) |
| `TransactionLog` | `TransactionLogs` | `Id`, `ShopifyOrderId` (String), `OrderName`, `TotalAmount`, `CategoryKey`, `Status` (`ALLOWED`/`BLOCKED`), `BlockReason` | Historia zamówień z Shopify |
| `TransactionLogItem` | `TransactionLogItems`| `Id`, `TransactionLogId` (FK), `ProductName`, `Quantity` (Int), `Price` (Decimal) | Pozycje składowe zamówień |
| `Notification` | `Notifications` | `Id`, `Title`, `Message`, `Type` (`Info`/`Warning`/`Alert`), `IsRead` (Bool), `CreatedAt` | Systemowe alerty i powiadomienia |
| `ApprovalRequest` | `ApprovalRequests` | `Id`, `TransactionLogId` (FK), `Status` (`Pending`/`Approved`/`Rejected`), `Notes`, `DecidedByUserId` (FK) | Workflow zatwierdzania wydatków ponad limit |
| `AuditLog` | `AuditLogs` | `Id`, `Action`, `EntityType`, `EntityId`, `Details`, `UserEmail`, `CreatedAt` | Pełna historia operacji w celach bezpieczeństwa |

---

## 🔌 4. Architektura Backendowa (`/backend`)

Zastosowano wzorzec **Controller-Service-Repository** (z EF Core jako repozytorium):

### Wstrzykiwanie Zależności (DI w `Program.cs`)
Usługi rejestrowane są jako `Scoped`:
*   `IBudgetLimitService` -> `BudgetLimitService` (Zarządzanie kategoriami i ich limitami)
*   `IAuthService` -> `AuthService` (Rejestracja, logowanie, haszowanie hasła przy użyciu BCrypt, generowanie JWT)
*   `ISummaryService` -> `SummaryService` (Obliczanie statystyk, wykresów, rankingów dla Dashboardu)
*   `ITransactionLogService` -> `TransactionLogService` (Rejestracja zamówień, weryfikacja limitów budżetu)
*   `IShopifyWebhookService` -> `ShopifyWebhookService` (Integracja z Shopify, wysyłanie poleceń blokady do API Shopify)
*   `IAiInsightsService` -> `AiInsightsService` (Generowanie analiz przy użyciu modelu Gemini)
*   `IApprovalService` -> `ApprovalService` (Zarządzanie żądaniami zatwierdzeń przez Administratora)
*   `INotificationService` -> `NotificationService` (Generowanie i odczyt powiadomień)
*   `IAuditLogService` -> `AuditLogService` (Zapis historii operacji)

### Obsługa Wyjątków (`/backend/Middlewares/ExceptionHandlingMiddleware.cs`)
Globalny middleware wyłapuje dedykowane wyjątki biznesowe z katalogu `/backend/Exceptions` i konwertuje je na poprawne kody HTTP:
*   `BrakAutoryzacjiException` -> `401 Unauthorized`
*   `NieZnalezionoZasobuException` -> `404 Not Found`
*   `NieprawidloweDaneException` -> `400 Bad Request`
*   Inne błędy systemowe -> `500 Internal Server Error`

### Autoryzacja i Kontrolery
*   Uwierzytelnianie odbywa się poprzez nagłówek `Authorization: Bearer <JWT_TOKEN>`.
*   Endpointy administracyjne są zabezpieczone atrybutem `[Authorize(Roles = "Admin")]`.
*   Struktura API opiera się na **DTO (Data Transfer Objects)** zlokalizowanych w katalogu `/backend/DTOs`. Do mapowania między modelami a DTO wykorzystywany jest **AutoMapper** (`Mappings/AutoMapperProfile.cs`).

---

## 💻 5. Architektura Frontendowa (`/frontend`)

Frontend to jednostronicowa aplikacja (SPA) oparta na komponentach Vue 3.

### Komunikacja z API (`/frontend/src/services/api.js`)
Axios jest skonfigurowany pod adresem `http://localhost:5258/api`. Posiada dwa interceptory:
1.  **Request Interceptor:** Pobiera token z `localStorage` i wstrzykuje go do nagłówków jako `Bearer`.
2.  **Response Interceptor:** Wyłapuje błędy `401 Unauthorized` i automatycznie wylogowuje użytkownika, przekierowując go na stronę `/login`.

### Zarządzanie Stanem (`/frontend/src/stores/auth.js`)
Pinia przechowuje dane zalogowanego użytkownika (`user`) oraz token JWT (`token`). Eksponuje gettery:
*   `isAuthenticated` (Boolean)
*   `isAdmin` (Boolean - sprawdza czy `role === 'Admin'`)

### Widoki i Komponenty (`/frontend/src/views`)
*   `DashboardView.vue` - podsumowanie, wykresy zużycia, asystent AI.
*   `BudgetsView.vue` - zarządzanie limitami i budżetem globalnym.
*   `ApprovalsView.vue` - dla administratorów (akceptowanie/odrzucanie zablokowanych transakcji).
*   `AuditView.vue` - podgląd logów audytowych (tylko Admin).
*   `LoginView.vue` - formularz logowania i rejestracji.
*   `LogsView.vue` - historia transakcji z Shopify.
*   `NotificationsView.vue` - lista powiadomień.

---

## 🤖 6. Integracja AI i Shopify

*   **Google Gemini AI:** Backend wysyła dane finansowe i historię transakcji do Gemini za pomocą biblioteki HttpClient, generując krótkie, precyzyjne prognozy finansowe na pozostałe dni miesiąca (`backend/Services/AiInsightsService.cs`).
*   **Weryfikacja HMAC Shopify:** Webhooki odbierane przez `WebhooksController.cs` na endpoint `POST /api/webhooks/orders` przechodzą walidację podpisu przy użyciu `ApiSecret` z pliku `appsettings.json`.

---

## 📝 7. Standardy Pisania Kodu dla AI

Kiedy generujesz lub modyfikujesz kod w tym projekcie, **musisz ściśle przestrzegać następujących reguł**:

### Zasady dla Backend (C# / .NET 10)
1.  **Asynchroniczność:** Wszystkie operacje na bazie danych (EF Core) oraz zapytania HTTP muszą być asynchroniczne (`async`/`await`).
2.  **Architektura warstwowa:** Nigdy nie umieszczaj logiki biznesowej bezpośrednio w kontrolerach. Kontrolery zajmują się wyłącznie walidacją DTO i zwracaniem kodów HTTP. Cała logika musi trafiać do klas w `/backend/Services`.
3.  **Mapowanie obiektów:** Zawsze używaj DTO w zapytaniach API. Mapuj encje bazy danych na DTO za pomocą `AutoMapper` zdefiniowanego w `Mappings/AutoMapperProfile.cs`.
4.  **Baza danych:** Nie twórz zapytań SQL ręcznie, chyba że jest to plik seedujący. Zawsze korzystaj z `AppDbContext` poprzez Entity Framework.
5.  **Błędy:** W przypadku niespełnienia warunków biznesowych (np. brak środków, brak zasobu) rzucaj dedykowane wyjątki (`BrakAutoryzacjiException`, `NieZnalezionoZasobuException`, `NieprawidloweDaneException`), które middleware automatycznie obsłuży.

### Zasady dla Frontend (Vue 3 / JS)
1.  **Composition API:** Zawsze używaj składni `<script setup>` w komponentach Vue.
2.  **Reaktywność:** Używaj `ref()` lub `reactive()` do zarządzania stanem komponentu.
3.  **Stan Globalny:** Uwierzytelnianie, profil użytkownika i token muszą być zarządzane wyłącznie przez Pinia Store (`useAuthStore` w `stores/auth.js`).
4.  **Komunikacja API:** Zawsze wykonuj żądania przez skonfigurowanego klienta Axios (`services/api.js`). Nigdy nie używaj bezpośrednio `fetch` ani czystego `axios`.
5.  **Stylizacja:** Zawsze używaj klas narzędziowych Tailwind CSS 4.0 do budowania interfejsu. Unikaj pisania czystego CSS w sekcjach `<style>`.
