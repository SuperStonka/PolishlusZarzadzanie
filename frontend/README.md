# Polishlus Frontend

## 🚀 Szybki start

### 1. Instalacja zależności
```bash
npm install
```

### 2. Konfiguracja środowiska
Skopiuj plik `env.example` do `.env`:
```bash
cp env.example .env
```

Edytuj plik `.env`:
```env
# Development (lokalny backend)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development

# Production (serwer)
# REACT_APP_API_URL=https://polishlus.arstudio.atthost24.pl/api
# REACT_APP_ENV=production
```

### 3. Uruchomienie aplikacji
```bash
npm start
```

Aplikacja będzie dostępna na: `http://localhost:3000`

## 🔧 Konfiguracja

### Backend URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://polishlus.arstudio.atthost24.pl/api`

### Zmienne środowiskowe
- `REACT_APP_API_URL` - URL backendu
- `REACT_APP_ENV` - środowisko (development/production)

## 📁 Struktura projektu

```
frontend/
├── src/
│   ├── components/     # Komponenty React
│   ├── listy/         # Listy (pracownicy, produkty, etc.)
│   ├── events/        # Komponenty eventów
│   ├── services/      # Serwisy API
│   ├── layout/        # Layout aplikacji
│   └── styles/        # Style CSS
├── public/
│   └── data/          # Pliki JSON (przestarzałe)
└── package.json
```

## 🔌 API Integration

### Serwis API
Główny serwis API znajduje się w `src/services/api.ts`:

```typescript
import api from '../services/api';

// Przykłady użycia
const pracownicy = await api.getEmployees();
const produkty = await api.getProducts();
const eventy = await api.getEvents();
```

### Endpointy
- `/api/auth/*` - Autoryzacja
- `/api/users` - Użytkownicy
- `/api/events` - Eventy
- `/api/products` - Produkty
- `/api/flowers` - Kwiaty
- `/api/employees` - Pracownicy
- `/api/contacts` - Kontakty
- `/api/cars` - Samochody
- `/api/rentals` - Wypożyczalnie
- `/api/cost-types` - Typy kosztów
- `/api/containers` - Pojemniki
- `/api/costs` - Koszty
- `/api/chat` - Chat
- `/api/notifications` - Powiadomienia
- `/api/status-updates` - Aktualizacje statusu

## 🛠️ Development

### Skrypty npm
```bash
npm start          # Uruchom w trybie deweloperskim
npm run build      # Zbuduj do produkcji
npm test           # Uruchom testy
npm run eject      # Eject z Create React App
```

### Hot Reload
Zmiany w kodzie są automatycznie odświeżane w przeglądarce.

### Debugging
- Otwórz DevTools (F12)
- Sprawdź zakładkę Console dla błędów
- Sprawdź zakładkę Network dla requestów API

## 🚀 Deployment

### Build do produkcji
```bash
npm run build
```

### Upload na serwer
Skopiuj zawartość folderu `build/` na serwer.

### Konfiguracja serwera
Upewnij się, że serwer jest skonfigurowany do obsługi React Router (SPA).

## 🔍 Troubleshooting

### Problem: "Cannot connect to backend"
1. Sprawdź czy backend jest uruchomiony
2. Sprawdź URL w `.env`
3. Sprawdź CORS w backendzie

### Problem: "API request failed"
1. Sprawdź logi w konsoli przeglądarki
2. Sprawdź czy endpoint istnieje w backendzie
3. Sprawdź autoryzację (tokeny)

### Problem: "Port 3000 is already in use"
```bash
PORT=3001 npm start
```

## 📚 Dokumentacja

- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Create React App](https://create-react-app.dev/)
