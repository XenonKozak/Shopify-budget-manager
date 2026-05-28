# Instrukcja obsługi — Shopify Budget Manager

## Spis treści

1. [Opis aplikacji](#1-opis-aplikacji)
2. [Wymagania systemowe](#2-wymagania-systemowe)
3. [Uruchomienie aplikacji](#3-uruchomienie-aplikacji)
4. [Rejestracja i logowanie](#4-rejestracja-i-logowanie)
5. [Role użytkowników](#5-role-użytkowników)
6. [Nadawanie roli administratora](#6-nadawanie-roli-administratora)
7. [Funkcjonalności aplikacji](#7-funkcjonalności-aplikacji)
   - [Dashboard](#71-dashboard)
   - [Zarządzanie budżetami](#72-zarządzanie-budżetami)
   - [Logi transakcji](#73-logi-transakcji)
   - [Zatwierdzanie wydatków](#74-zatwierdzanie-wydatków)
   - [Powiadomienia](#75-powiadomienia)
   - [Historia operacji](#76-historia-operacji)
   - [Asystent AI](#77-asystent-ai)
8. [Integracja z Shopify](#8-integracja-z-shopify)
9. [Konfiguracja](#9-konfiguracja)
10. [Struktura bazy danych](#10-struktura-bazy-danych)

---

## 1. Opis aplikacji

Shopify Budget Manager to aplikacja webowa wspomagająca kontrolę wydatków w środowisku e-commerce. System integruje się z platformą Shopify i umożliwia:

- monitorowanie wydatków z zamówień Shopify,
- definiowanie limitów budżetowych dla kategorii,
- automatyczne blokowanie zamówień przekraczających budżet,
- zatwierdzanie wydatków przez administratora,
- analizę wydatków za pomocą wykresów,
- prognozowanie finansowe z wykorzystaniem sztucznej inteligencji (Gemini).

---

## 2. Wymagania systemowe

### Backend
- .NET 10.0 SDK
- Microsoft SQL Server (LocalDB lub pełna wersja)
- Entity Framework Core CLI (`dotnet tool install --global dotnet-ef`)

### Frontend
- Node.js (wersja 18+)
- npm

### Opcjonalne
- Konto Shopify z dostępem do Admin API (do integracji ze sklepem)
- Klucz API Google Gemini (do funkcji asystenta AI)

---

## 3. Uruchomienie aplikacji

### Krok 1 — Konfiguracja bazy danych

Upewnij się, że w pliku `backend/appsettings.json` masz poprawny connection string:

```json
"ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ShopifyBudgetManagerDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

> Jeżeli korzystasz z innego serwera SQL, zmień `Server=` na odpowiedni adres.

### Krok 2 — Migracja bazy danych

Otwórz terminal w katalogu `backend/` i wykonaj:

```bash
dotnet ef database update
```

To utworzy wszystkie tabele w bazie danych.

### Krok 3 — Uruchomienie backendu

W katalogu `backend/`:

```bash
dotnet run
```

Backend uruchomi się domyślnie na `http://localhost:5258`.

### Krok 4 — Instalacja zależności frontendu

W katalogu `frontend/` (tylko za pierwszym razem):

```bash
npm install
```

### Krok 5 — Uruchomienie frontendu

W katalogu `frontend/`:

```bash
npm run dev
```

Frontend uruchomi się na `http://localhost:5173`.

### Krok 6 — Otwórz przeglądarkę

Wejdź na adres: **http://localhost:5173**

---

## 4. Rejestracja i logowanie

### Rejestracja

1. Otwórz stronę logowania (`http://localhost:5173/login`).
2. Kliknij link **„Zarejestruj się"** na dole formularza.
3. Wpisz adres e-mail i hasło.
4. Kliknij **„Zarejestruj się"**.
5. System automatycznie zaloguje Cię i przekieruje na Dashboard.

Każdy nowo zarejestrowany użytkownik domyślnie otrzymuje rolę **User** (użytkownik standardowy).

### Logowanie

1. Wpisz e-mail i hasło na stronie logowania.
2. Kliknij **„Zaloguj się"**.
3. Po poprawnym zalogowaniu zostaniesz przekierowany na Dashboard.

Token JWT jest ważny przez **2 godziny**. Po wygaśnięciu tokenu użytkownik zostanie automatycznie wylogowany.

---

## 5. Role użytkowników

System rozróżnia dwie role:

| Rola | Uprawnienia |
|------|------------|
| **User** | Przeglądanie wydatków, budżetów, powiadomień. Tworzenie i edycja własnych budżetów. Korzystanie z asystenta AI. |
| **Admin** | Wszystkie uprawnienia użytkownika + zatwierdzanie/odrzucanie wydatków przekraczających limity (Approval Workflow). |

Rola użytkownika wyświetla się w prawym górnym rogu nawigacji obok adresu e-mail.

---

## 6. Nadawanie roli administratora

Domyślnie każdy zarejestrowany użytkownik ma rolę **User**. Aby nadać komuś rolę **Admin**, należy zmienić wartość w bazie danych.

### Sposób 1 — SQL Server Management Studio (SSMS)

1. Otwórz SSMS i połącz się z bazą danych `ShopifyBudgetManagerDb`.
2. Wykonaj zapytanie SQL:

```sql
-- Sprawdź listę użytkowników
SELECT Id, Email, Role FROM Users;

-- Nadaj rolę Admin użytkownikowi o konkretnym emailu
UPDATE Users SET Role = 'Admin' WHERE Email = 'twoj@email.com';
```

3. Po wykonaniu zapytania użytkownik musi się **wylogować i zalogować ponownie**, aby nowy token JWT zawierał zaktualizowaną rolę.

### Sposób 2 — Visual Studio SQL Server Object Explorer

1. W Visual Studio otwórz **View → SQL Server Object Explorer**.
2. Rozwiń: `(localdb)\mssqllocaldb → Databases → ShopifyBudgetManagerDb → Tables → dbo.Users`.
3. Kliknij prawym przyciskiem → **View Data**.
4. Znajdź wiersz z odpowiednim użytkownikiem i zmień wartość kolumny `Role` z `User` na `Admin`.

### Sposób 3 — Komenda sqlcmd (terminal)

```bash
sqlcmd -S (localdb)\mssqllocaldb -d ShopifyBudgetManagerDb -Q "UPDATE Users SET Role = 'Admin' WHERE Email = 'twoj@email.com'"
```

> **Ważne:** Po zmianie roli w bazie danych użytkownik musi się wylogować i zalogować ponownie.

---

## 7. Funkcjonalności aplikacji

### 7.1 Dashboard

Dashboard to strona główna aplikacji po zalogowaniu. Prezentuje:

- **Karty statystyk** — budżet miesięczny, wydana kwota, pozostały budżet, liczba zablokowanych zakupów.
- **Dodatkowe wskaźniki** — liczba aktywnych kategorii budżetowych, oczekujących zatwierdzeń, nieprzeczytanych alertów.
- **Pasek zużycia budżetu** — wizualizacja procentowego wykorzystania budżetu globalnego (zielony/żółty/czerwony).
- **Wykres kołowy** — rozkład wydatków według kategorii budżetowych.
- **Wykres liniowy** — wydatki dzienne w bieżącym miesiącu.
- **Ranking kategorii** — lista kategorii posortowana od największych wydatków, z progress barami.
- **Asystent AI** — przycisk do generowania analizy finansowej.

### 7.2 Zarządzanie budżetami

Dostępne pod zakładką **„Budżety"**.

#### Budżet globalny
- Kliknij **„Ustaw budżet globalny"** aby zdefiniować maksymalną kwotę do wydania w miesiącu.
- Jest to ogólny limit, na podstawie którego obliczany jest pozostały budżet na Dashboardzie.

#### Limity kategorii
- Kliknij **„+ Nowy limit"** aby dodać limit dla konkretnej kategorii.
- Wypełnij formularz:
  - **Nazwa** — np. „Elektronika", „Marketing", „Ubrania"
  - **Kategoria** — identyfikator kategorii (np. „electronics", „marketing") — musi być unikalny
  - **Limit miesięczny** — maksymalna kwota do wydania w tej kategorii
- Każdy limit ma **progress bar** pokazujący procentowe wykorzystanie.
- Możesz **edytować** (ikona ołówka) lub **usunąć** (ikona kosza) istniejące limity.
- Limit można **dezaktywować** (checkbox „Aktywny" w edycji) — nieaktywne limity są wyszarzone.

### 7.3 Logi transakcji

Dostępne pod zakładką **„Transakcje"**.

- Tabela z historią wszystkich zamówień przetworzonych przez system.
- Kolumny: data, nazwa zamówienia, kategoria, status, kwota, lista produktów.
- **Status ALLOWED (Zaakceptowane)** — zamówienie mieści się w limicie budżetowym.
- **Status BLOCKED (Zablokowane)** — zamówienie przekroczyło limit i zostało zablokowane/anulowane w Shopify.
- Zablokowane zamówienia mają kwotę przekreśloną i wyświetlają powód blokady.

### 7.4 Zatwierdzanie wydatków

Dostępne pod zakładką **„Zatwierdzanie"**.

Gdy zamówienie ze sklepu Shopify przekracza ustalony limit budżetowy:
1. Zamówienie zostaje zablokowane (anulowane w Shopify).
2. System automatycznie tworzy **żądanie zatwierdzenia** (Approval Request) ze statusem „Oczekuje".
3. Administrator widzi listę oczekujących żądań.
4. Administrator może:
   - **Zaakceptować** — klikając przycisk „Akceptuj" (z opcjonalną notatką)
   - **Odrzucić** — klikając przycisk „Odrzuć" (z opcjonalną notatką)
5. Po podjęciu decyzji system tworzy powiadomienie i wpis w historii operacji.

Widok pokazuje wszystkie żądania (oczekujące, zaakceptowane, odrzucone) z datami i notatkami.

### 7.5 Powiadomienia

Dostępne pod zakładką **„Powiadomienia"**.

System automatycznie generuje alerty w następujących sytuacjach:

| Typ | Kiedy się pojawia | Ikona |
|-----|-------------------|-------|
| **Przekroczenie budżetu** | Zamówienie przekracza limit kategorii | 🚫 |
| **Ostrzeżenie** | Wydatki przekraczają 80% limitu kategorii | ⚠️ |
| **Wymaga zatwierdzenia** | Utworzono nowe żądanie zatwierdzenia | 📋 |
| **Decyzja** | Administrator podjął decyzję o zatwierdzeniu/odrzuceniu | ✅ |

- Nieprzeczytane powiadomienia mają niebieskie tło i niebieską kropkę.
- Kliknięcie na powiadomienie oznacza je jako przeczytane.
- Przycisk **„Oznacz wszystkie jako przeczytane"** oznacza wszystkie naraz.
- W nawigacji (zakładka „Powiadomienia") widoczna jest czerwona **odznaka** z liczbą nieprzeczytanych alertów.

### 7.6 Historia operacji

Dostępne pod zakładką **„Historia"**.

Tabela logów audytowych rejestrujących:
- Odbiór webhooków z Shopify (WebhookReceived)
- Decyzje zatwierdzania wydatków (ApprovalDecision)
- Inne operacje systemowe

Każdy wpis zawiera: datę, typ akcji, typ encji, identyfikator, email użytkownika i szczegóły.

### 7.7 Asystent AI

Dostępny na stronie **Dashboard**.

- Kliknij przycisk **„Analizuj budżet"**.
- System wysyła aktualne dane finansowe (budżety, wydatki, ostatnie transakcje) do API Google Gemini.
- Model AI generuje krótką analizę z prognozą wydatków na pozostałą część miesiąca.
- Analiza wyświetla się w szarym polu poniżej przycisku.

> Wymaga skonfigurowanego klucza API Gemini w `appsettings.json` (sekcja `Gemini:ApiKey`).

---

## 8. Integracja z Shopify

### Jak działa integracja

1. Sklep Shopify wysyła **webhook** do aplikacji przy każdym nowym zamówieniu.
2. Backend odbiera webhook na endpoint: `POST /api/webhooks/orders`
3. System weryfikuje podpis HMAC (bezpieczeństwo).
4. Backend analizuje zamówienie:
   - Sprawdza kategorię wydatku
   - Porównuje z aktywnym limitem budżetowym
   - Jeśli limit nie jest przekroczony → zamówienie zaakceptowane, budżet zaktualizowany
   - Jeśli limit przekroczony → zamówienie zablokowane (anulowane w Shopify), utworzony Approval Request i powiadomienie

### Konfiguracja Shopify

W pliku `backend/appsettings.json` uzupełnij sekcję:

```json
"Shopify": {
    "ApiSecret": "twoj_api_secret",
    "ShopName": "twoj-sklep.myshopify.com",
    "AccessToken": "twoj_access_token"
}
```

Następnie w panelu administracyjnym Shopify:
1. Przejdź do **Settings → Notifications → Webhooks**.
2. Dodaj webhook:
   - **Event:** Order creation
   - **URL:** `https://twoja-domena.pl/api/webhooks/orders`
   - **Format:** JSON

> W trybie deweloperskim (localhost) webhook z Shopify nie dotrze bezpośrednio. Możesz użyć narzędzia takiego jak **ngrok** do tunelowania ruchu.

---

## 9. Konfiguracja

Główny plik konfiguracyjny: `backend/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=ShopifyBudgetManagerDb;..."
  },
  "Jwt": {
    "Key": "SuperSecretKeyForShopifyBudgetManagerDoNotShare12345",
    "Issuer": "ShopifyBudgetManagerApi",
    "Audience": "ShopifyBudgetManagerClient"
  },
  "Shopify": {
    "ApiSecret": "...",
    "ShopName": "...",
    "AccessToken": "..."
  },
  "Gemini": {
    "ApiKey": "..."
  }
}
```

| Sekcja | Opis |
|--------|------|
| `ConnectionStrings` | Connection string do bazy danych SQL Server |
| `Jwt` | Klucz, issuer i audience dla tokenów JWT |
| `Shopify` | Dane do integracji z API Shopify |
| `Gemini` | Klucz API do modelu Gemini (asystent AI) |

---

## 10. Struktura bazy danych

Aplikacja korzysta z następujących tabel:

| Tabela | Opis |
|--------|------|
| `Users` | Użytkownicy systemu (email, hasło, rola) |
| `BudgetLimits` | Limity budżetowe per kategoria (nazwa, limit, wydano, waluta, aktywność) |
| `GlobalSettings` | Ustawienia globalne (np. całkowity budżet miesięczny) |
| `TransactionLogs` | Logi zamówień z Shopify (id zamówienia, kwota, status, kategoria) |
| `TransactionLogItems` | Pozycje zamówienia (produkty, ilości, ceny) |
| `Notifications` | Powiadomienia systemowe (tytuł, treść, typ, przeczytane) |
| `ApprovalRequests` | Żądania zatwierdzenia wydatków (zamówienie, kwota, status decyzji) |
| `AuditLogs` | Historia operacji (akcja, typ encji, szczegóły, użytkownik) |

### Technologie

- **Frontend:** Vue 3 + Vite + TailwindCSS + Pinia + Axios + Chart.js
- **Backend:** ASP.NET Core Web API + Entity Framework Core + AutoMapper
- **Baza danych:** Microsoft SQL Server
- **Integracje:** Shopify Admin API + Webhooks, Google Gemini API
- **Autoryzacja:** JWT (JSON Web Tokens) + Role-Based Authorization
