# Shopify Budget Manager

Aplikacja webowa napisana w **Next.js** (App Router), służąca do zarządzania osobistym budżetem i limitami wydatków, z bezpośrednią integracją ze sklepem **Shopify**.

Jej głównym zadaniem jest śledzenie naszych zakupów w czasie rzeczywistym i automatyczne blokowanie (anulowanie) zamówień w e-commerce, jeśli przekroczą one ustalony przez nas miesięczny limit.

## Główne funkcjonalności

* **Dashboard (Panel Główny):** Podsumowanie aktualnych wydatków, statystyki w czasie rzeczywistym i szybki podgląd do zablokowanych transakcji.
* **Zarządzanie Limitami:** Możliwość tworzenia kategorii budżetowych (np. "Ogólne", "Ubrania") i przypisywania im miesięcznych limitów kwotowych (np. w PLN).
* **Historia Transakcji:** Rejestr wszystkich zakupów zaimportowanych z profilu klienta Shopify, wraz ze szczegółami zamówienia (produkty, ceny, miniaturki zdjęć, oraz informacje o statusie).
* **Ochrona Budżetu (Webhooki):** Aplikacja nasłuchuje zdarzeń tworzenia zamówień (`orders/create`) z Shopify. Jeśli nowe zamówienie sprawi, że suma wydatków przekroczy nałożony miesięczny limit, aplikacja (za pośrednictwem API Shopify) **anuluje to zamówienie**.

## Użyte technologie

* **Frontend:** React, Next.js (App Router), Tailwind CSS, Lucide React (ikony)
* **Backend:** Next.js API Routes (Serverless)
* **Baza Danych:** MongoDB (Mongoose dla modelowania i walidacji danych)
* **Integracja:** REST API Shopify / Shopify Webhooks

## Konfiguracja i uruchomienie lokalnie

### Wymagania wstępne
- Środowisko Node.js
- Klaster bazy danych MongoDB (np. darmowy strumień w MongoDB Atlas)
- Sklep na platformie Shopify z wygenerowaną integracją typu 'Custom App' (wymaga 'Admin API access scopes' dot. `orders` i `products`).

### 1. Instalacja zależności
```bash
npm install
```

### 2. Zmienne środowiskowe
Utwórz plik `.env.local` w głównym katalogu projektu (nie dodawaj go do systemu kontroli wersji!) i uzupełnij poniższymi danymi:

```env
MONGODB_URI=mongodb+srv://<uzytkownik>:<haslo>@<klaster>.mongodb.net/budget-manager
SHOPIFY_SHOP_NAME=nazwa-twojego-sklepu.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_twoj_dlugi_token_dostepu_z_shopify
```

### 3. Uruchomienie aplikacji
```bash
npm run dev
```

Otwórz w przeglądarce [http://localhost:3000](http://localhost:3000).

## Wdrożenie a Webhooki (Shopify)
Aby system automatycznie śledził "prawdziwe" zamówienia ze sklepu, musi być wdrożony na publicznie dostępnym serwerze (np. **Vercel**), co wygeneruje publiczny URL. 

Następnie w panelu administracyjnym sklepu Shopify należy wejść w *Ustawienia -> Powiadomienia -> Webhooks* i podpiąć publiczny adres `/api/webhooks/orders` pod zdarzenie tworzenia zamówienia (`Order creation`).

Dzięki temu aplikacja każdorazowo zostanie "wywołana" przy zakupie dokonanych na powiązanym sklepie i sprawdzi go z personalnymi limitami zapisanymi w bazie danych MongoDB.

---
*Projekt zrealizowany na potrzeby zaliczenia.*
