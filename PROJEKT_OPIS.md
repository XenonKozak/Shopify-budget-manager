# Shopify Budget Manager — Dokumentacja Projektu

## 1. Cel i Opis Projektu
**Shopify Budget Manager** to zaawansowana aplikacja webowa zaprojektowana do wspomagania kontroli wydatków w środowisku e-commerce poprzez głęboką integrację z platformą Shopify. System umożliwia precyzyjne monitorowanie transakcji, analizę budżetów w czasie rzeczywistym oraz automatyczne reagowanie na przekroczenia limitów finansowych.

### Grupa docelowa:
- Małe i średnie firmy e-commerce.
- Zespoły zakupowe i działy zaopatrzenia.
- Sklepy internetowe wymagające ścisłej kontroli kosztów operacyjnych.
- Użytkownicy prywatni zarządzający wieloma sklepami.

Projekt służy jako narzędzie wspomagające podejmowanie decyzji finansowych, a nie jako system księgowy.

## 2. Architektura i Stack Technologiczny

### Backend
- **Technologia**: ASP.NET Core 10.0 Web API.
- **Baza danych**: Microsoft SQL Server (zarządzany przez Entity Framework Core).
- **Bezpieczeństwo**: JWT Authentication, Role-Based Authorization.
- **Integracje**: Shopify Admin API, Shopify Webhooks (weryfikacja HMAC).
- **Biblioteki**: AutoMapper, ShopifySharp, FluentValidation.

### Frontend
- **Framework**: Vue 3 (Composition API) + Vite.
- **Stylizacja**: Tailwind CSS 4.0.
- **Zarządzanie stanem**: Pinia.
- **Komunikacja**: Axios.
- **Wizualizacja**: Chart.js.

### AI
- **Model**: Google Gemini API (analiza trendów i prognozowanie).

## 3. Typy Użytkowników i Uprawnienia

| Rola | Uprawnienia |
| :--- | :--- |
| **Administrator** | Pełne zarządzanie użytkownikami, budżetami i kategoriami. Zatwierdzanie/odrzucanie wydatków (Approval Workflow). Konfiguracja integracji Shopify. |
| **Użytkownik Standardowy** | Przegląd własnych wydatków, monitorowanie budżetów, otrzymywanie alertów i analiza statystyk. |

## 4. Kluczowe Funkcjonalności

### 4.1. Integracja z Shopify
System w czasie rzeczywistym odbiera i przetwarza dane ze sklepu:
- **Webhooki**: `orders/create`, `orders/paid`, `orders/cancelled`, `refunds/create`.
- **Synchronizacja**: Pobieranie historycznych zamówień i aktualizacja statusów.

### 4.2. Zarządzanie Budżetami
Użytkownicy mogą definiować limity dla kategorii takich jak:
- Marketing, Elektronika, Oprogramowanie, Logistyka, itp.
- Możliwość ustawiania budżetów miesięcznych i globalnych.

### 4.3. Approval Workflow (Obieg Zatwierdzeń)
Krytyczna funkcja kontrolna:
1. Zamówienie przekracza limit -> status "Pending Approval".
2. Automatyczna blokada zamówienia w Shopify.
3. Powiadomienie administratora.
4. Decyzja administratora (Akceptacja/Odrzucenie/Wyjątek).

### 4.4. Dashboard i Analityka
- Wizualizacja zużycia budżetu (wykresy kołowe i liniowe).
- Rankingi kategorii generujących największe koszty.
- **Asystent AI**: Generowanie prognoz wydatków na koniec miesiąca w oparciu o bieżące tempo zakupów.

## 5. User Stories

| Rola | Cel | Powód |
| :--- | :--- | :--- |
| **Menedżer** | Chcę ustawić limit 5000 PLN na kategorię "Software". | Aby uniknąć niekontrolowanych subskrypcji narzędzi. |
| **Właściciel** | Chcę, aby każde zamówienie powyżej budżetu wymagało mojej zgody. | Aby utrzymać płynność finansową firmy. |
| **Pracownik** | Chcę widzieć na wykresie, ile budżetu zostało mi do końca miesiąca. | Aby móc zaplanować niezbędne zakupy sprzętowe. |
| **Administrator** | Chcę otrzymywać powiadomienia e-mail o zablokowanych zamówieniach. | Aby móc szybko podjąć decyzję o ich ewentualnym odblokowaniu. |

## 6. Proces Działania Systemu (Workflow)
1. **Połączenie**: Użytkownik autoryzuje sklep Shopify.
2. **Synchronizacja**: Pobranie aktualnych danych o wydatkach.
3. **Zdarzenie**: Nowe zamówienie w Shopify wyzwala Webhook.
4. **Analiza**: Backend sprawdza wartość zamówienia vs. limit kategorii.
5. **Decyzja**:
   - W limicie -> Akceptacja transakcji.
   - Poza limitem -> Blokada, utworzenie Approval Request, wysłanie Alertu.
6. **Reakcja**: Administrator zatwierdza lub odrzuca wydatek.

## 7. Cel Biznesowy
Głównym celem jest **ograniczenie nadmiernych kosztów** i wprowadzenie **transparentności** w wydatkach e-commerce. Dzięki automatyzacji blokad i analizie AI, firmy mogą lepiej planować swoje finanse i unikać błędów ludzkich w zarządzaniu budżetem.
