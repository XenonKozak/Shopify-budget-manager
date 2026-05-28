# Projekt aplikacji webowej wspomagającej kontrolę wydatków w środowisku e-commerce na przykładzie platformy Shopify

## 1. Opis projektu

Celem projektu jest stworzenie aplikacji webowej wspomagającej kontrolę wydatków w środowisku e-commerce poprzez integrację z platformą Shopify. System ma umożliwiać monitorowanie wydatków, analizę budżetów, zarządzanie limitami finansowymi oraz automatyczne reagowanie na przekroczenia budżetowe.

Aplikacja ma być przeznaczona zarówno dla:
- małych i średnich firm,
- zespołów zakupowych,
- sklepów internetowych,
- użytkowników prywatnych i rodzin.

Projekt nie ma pełnić funkcji systemu księgowego, lecz narzędzia wspomagającego podejmowanie decyzji finansowych i kontrolę wydatków.

---

# 2. Główne założenia systemu

System:
- integruje się z Shopify API,
- pobiera informacje o zamówieniach,
- analizuje wydatki użytkownika,
- przypisuje wydatki do kategorii budżetowych,
- monitoruje wykorzystanie budżetu,
- wysyła alerty o przekroczeniach,
- umożliwia zatwierdzanie wydatków przekraczających limity,
- generuje statystyki i raporty.

---

# 3. Typy użytkowników

## 3.1 Administrator
Administrator posiada pełny dostęp do systemu:
- zarządzanie użytkownikami,
- tworzenie budżetów,
- konfiguracja kategorii,
- przegląd raportów,
- zatwierdzanie wydatków,
- konfiguracja integracji Shopify.

## 3.2 Użytkownik standardowy
Użytkownik może:
- przeglądać własne wydatki,
- obserwować budżety,
- otrzymywać alerty,
- analizować statystyki.

---

# 4. Główne funkcjonalności aplikacji

# 4.1 Integracja z Shopify

System wykorzystuje Shopify Admin API oraz webhooki.

## Funkcje integracji:
- autoryzacja sklepu Shopify,
- pobieranie zamówień,
- synchronizacja danych,
- odbieranie webhooków,
- aktualizacja statusów zamówień.

## Wykorzystywane webhooki:
- orders/create
- orders/paid
- orders/cancelled
- refunds/create

---

# 4.2 Zarządzanie budżetami

Użytkownik może definiować budżety:
- miesięczne,
- tygodniowe,
- dla konkretnych kategorii,
- dla zespołów lub działów.

## Przykładowe kategorie:
- Marketing,
- Elektronika,
- Oprogramowanie,
- Ubrania,
- Jedzenie,
- Rozrywka.

## Możliwości:
- ustawianie limitów,
- edycja budżetów,
- reset budżetu po zakończeniu okresu,
- analiza wykorzystania budżetu.

---

# 4.3 Dashboard i analityka

System posiada dashboard prezentujący:
- aktualne wydatki,
- pozostały budżet,
- procent wykorzystania budżetu,
- historię wydatków,
- trendy zakupowe,
- wykresy i statystyki.

## Dashboard powinien zawierać:
- wykres kołowy wydatków,
- wykres liniowy wydatków w czasie,
- tabelę ostatnich transakcji,
- sekcję alertów,
- ranking kategorii wydatków.

---

# 4.4 System alertów

Aplikacja wysyła powiadomienia w przypadku:
- przekroczenia budżetu,
- zbliżania się do limitu,
- nietypowych wydatków,
- gwałtownego wzrostu zakupów.

## Formy powiadomień:
- e-mail,
- webhook,


---

# 4.5 Approval workflow

Jeżeli wydatek przekracza ustalony limit:
- zamówienie otrzymuje status "Pending Approval",
- administrator otrzymuje powiadomienie,
- administrator może:
  - zaakceptować wydatek,
  - odrzucić wydatek,
  - oznaczyć wydatek jako wyjątek.

## Cel funkcjonalności:
- kontrola kosztów,
- ograniczenie nieautoryzowanych zakupów,
- zarządzanie budżetami zespołów.

---

# 4.6 Historia operacji i logi

System zapisuje:
- historię zmian budżetów,
- historię zatwierdzeń,
- logi webhooków,
- historię synchronizacji danych,
- działania użytkowników.

---

# 4.7 Prognozowanie wydatków

System analizuje tempo wydatków i generuje prognozy.

## Przykłady:
- przewidywane przekroczenie budżetu,
- średni koszt zakupów,
- porównanie miesiąc do miesiąca,
- analiza trendów zakupowych.

---

# 5. Architektura systemu

## 5.1 Frontend

Frontend zostanie wykonany w:
- Vue 3,
- Vite,
- TailwindCSS.

## Funkcje frontendu:
- dashboard,
- formularze CRUD,
- wykresy,
- autoryzacja użytkownika,
- responsywny interfejs użytkownika.

---

## 5.2 Backend

Backend zostanie wykonany w:
- ASP.NET Core Web API.

## Zadania backendu:
- obsługa logiki biznesowej,
- komunikacja z Shopify API,
- obsługa webhooków,
- autoryzacja użytkowników,
- analiza wydatków,
- zarządzanie budżetami.

---

## 5.3 Baza danych

Baza danych:
- Microsoft SQL Server.

## Główne tabele:
- Users,
- Roles,
- Budgets,
- Categories,
- Orders,
- Transactions,
- Notifications,
- ApprovalRequests,
- AuditLogs.

---

# 6. Proces działania aplikacji

## Scenariusz działania

### Krok 1
Użytkownik łączy aplikację ze sklepem Shopify.

### Krok 2
System pobiera zamówienia i synchronizuje dane.

### Krok 3
Każde nowe zamówienie uruchamia webhook.

### Krok 4
Backend analizuje:
- kategorię wydatku,
- wartość zamówienia,
- aktualny stan budżetu.

### Krok 5
Jeżeli limit nie został przekroczony:
- zamówienie zostaje zaakceptowane.

### Krok 6
Jeżeli limit został przekroczony:
- system wysyła alert,
- tworzy Approval Request,
- oznacza zamówienie jako wymagające zatwierdzenia.

### Krok 7
Administrator podejmuje decyzję.

---

# 7. Bezpieczeństwo

System powinien zawierać:
- JWT Authentication,
- Role Based Authorization,
- szyfrowanie danych,
- walidację webhooków Shopify,
- ochronę endpointów API,
- logowanie błędów.

---

# 8. Możliwe rozszerzenia projektu

## Możliwe funkcje dodatkowe:
- analiza AI wydatków,
- rekomendacje oszczędności,
- integracja z innymi platformami e-commerce,
- eksport raportów PDF/Excel,
- system celów finansowych,


---

# 9. Technologie wykorzystane w projekcie

## Frontend
- Vue 3
- Vite
- TailwindCSS
- Axios
- Pinia

## Backend
- ASP.NET Core
- Entity Framework Core
- AutoMapper
- FluentValidation

## Baza danych
- Microsoft SQL Server

## Integracje
- Shopify Admin API
- Shopify Webhooks

---

# 10. Cel biznesowy projektu

Projekt ma wspomagać:
- kontrolę wydatków,
- zarządzanie budżetami,
- analizę zakupów,
- podejmowanie decyzji finansowych,
- ograniczanie nadmiernych kosztów.

Aplikacja ma stanowić przykład nowoczesnego systemu wspierającego kontrolę finansową w środowisku e-commerce.

