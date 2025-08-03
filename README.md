# Polishlus - Aplikacja Pakowania

Aplikacja do zarządzania procesami pakowania, montażu i demontażu eventów oraz kalkulacji kosztów.

## 🚀 Funkcjonalności

### 📊 Dashboard
- Przegląd wszystkich eventów
- Kalendarz z różnymi typami eventów (główny, pakowanie, montaż, demontaż)
- Powiadomienia o nowych eventach i statusach

### 💬 Chat
- Komunikacja między użytkownikami
- Wysyłanie wiadomości ogólnych i prywatnych
- Obsługa zdjęć w wiadomościach
- Historia konwersacji

### 📅 Kalendarz
- Widok miesięczny z eventami
- Różne kolory dla różnych typów eventów
- Nawigacja po datach
- Liczba eventów na dzień

### 🏪 Magazyn
- **Produkty** - zarządzanie produktami
- **Kategorie produktów** - kategoryzacja
- **Kwiaty** - zarządzanie kwiatami
- **Pojemniki** - zarządzanie pojemnikami

### 💰 Koszty
- **Kalkulacja** - kalkulacja kosztów eventów
- **Typy kosztów** - definiowanie typów kosztów
- **Samochody** - zarządzanie flotą pojazdów

### 👥 Zarządzanie
- **Pracownicy** - zarządzanie personelem
- **Kontakty** - baza kontaktów
- **Wypożyczalnie** - zarządzanie wypożyczalniami
- **Stanowiska** - definiowanie stanowisk
- **Użytkownicy** - zarządzanie użytkownikami
- **Grupy uprawnień** - system uprawnień

## 🛠️ Technologie

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: CSS3 z custom properties
- **Ikony**: Lucide React
- **Animacje**: CSS Keyframes

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer

## 📦 Instalacja

### Prerequisites

1. **Node.js** (v16 lub wyższy)
2. **PostgreSQL** (v12 lub wyższy)
3. **npm** lub **yarn**

### 1. Sklonuj repozytorium
```bash
git clone https://github.com/your-username/polishlus-pakowanie.git
cd polishlus-pakowanie
```

### 2. Skonfiguruj bazę danych PostgreSQL

#### Utwórz bazę danych:
```sql
CREATE DATABASE polishlus_db;
```

#### Lub użyj psql:
```bash
psql -U postgres
CREATE DATABASE polishlus_db;
\q
```

### 3. Skonfiguruj Backend

```bash
cd backend
npm install
```

#### Skopiuj plik konfiguracyjny:
```bash
cp env.example .env
```

#### Edytuj `.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polishlus_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Uruchom setup bazy danych:
```bash
npm run setup
```

To polecenie:
- Utworzy wszystkie tabele w bazie danych
- Zmigruje dane z plików JSON do PostgreSQL
- Skonfiguruje indeksy i triggery

#### Uruchom backend:
```bash
npm run dev
```

Backend będzie dostępny pod adresem `http://localhost:5000`

### 4. Skonfiguruj Frontend

```bash
cd frontend
npm install
```

#### Uruchom frontend:
```bash
npm start
```

Frontend będzie dostępny pod adresem `http://localhost:3000`

## 🌐 Deployment na Hosting

### Konfiguracja Hostingu

Aplikacja jest skonfigurowana do pracy z hostingiem:
- **Host**: `hosting2352919.online.pro`
- **Database**: `00887440_polishlus2`
- **Username**: `00887440_polishlus2`
- **Password**: `Lsu0!Tks12SX`

### Szybki Setup na Hostingu

```bash
cd backend
chmod +x setup-hosting.sh
./setup-hosting.sh
```

### Ręczny Setup

1. **Utwórz plik `.env`**:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=hosting2352919.online.pro
DB_PORT=5432
DB_NAME=00887440_polishlus2
DB_USER=00887440_polishlus2
DB_PASSWORD=Lsu0!Tks12SX

# JWT Configuration
JWT_SECRET=polishlus_production_secret_key_2024
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://your-domain.com
```

2. **Zainstaluj zależności**:
```bash
npm install --production
```

3. **Skonfiguruj bazę danych**:
```bash
npm run setup:prod
```

4. **Uruchom serwer**:
```bash
npm run start:prod
```

### Testowanie Deploymentu

```bash
# Health check
curl https://your-domain.com/api/health

# Test logowania
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@polishlus.com","haslo":"password123"}'
```

Więcej informacji o deploymentu znajdziesz w `backend/DEPLOYMENT.md`.

## 📁 Struktura projektu

```
polishlus-pakowanie/
├── frontend/                 # React aplikacja
│   ├── public/
│   │   ├── data/            # Mock dane JSON (do migracji)
│   │   └── images/          # Obrazy produktów
│   ├── src/
│   │   ├── components/      # Komponenty UI
│   │   ├── events/          # Komponenty eventów
│   │   ├── layout/          # Layout aplikacji
│   │   ├── listy/           # Listy zarządzania
│   │   ├── pages/           # Strony aplikacji
│   │   ├── styles/          # Style CSS
│   │   └── utils/           # Narzędzia
│   └── package.json
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── config/          # Konfiguracja bazy danych
│   │   ├── routes/          # Endpointy API
│   │   ├── middleware/      # Middleware (auth, etc.)
│   │   └── utils/           # Narzędzia (migracje)
│   ├── uploads/             # Pliki uploadowane
│   ├── setup-hosting.sh     # Skrypt setup dla hostingu
│   ├── DEPLOYMENT.md        # Przewodnik deploymentu
│   └── package.json
└── README.md
```

## 🗄️ Baza danych

### Tabele główne:
- **users** - Konta użytkowników i uwierzytelnianie
- **eventy** - Eventy i projekty
- **produkty** - Inwentarz produktów
- **kwiaty** - Inwentarz kwiatów
- **pracownicy** - Pracownicy
- **kontakty** - Kontakty
- **samochody** - Flota pojazdów
- **wypozyczalnie** - Firmy wypożyczające

### Tabele łączące:
- **produkty_w_eventach** - Produkty przypisane do eventów
- **kwiaty_w_eventach** - Kwiaty przypisane do eventów
- **koszty_eventow** - Kalkulacje kosztów eventów
- **wiadomosci_chat** - Wiadomości czatu
- **powiadomienia** - Powiadomienia systemowe

## 🔌 API Endpoints

### Uwierzytelnianie
- `POST /api/auth/register` - Rejestracja nowego użytkownika
- `POST /api/auth/login` - Logowanie użytkownika
- `GET /api/auth/profile` - Pobierz profil użytkownika
- `PUT /api/auth/profile` - Aktualizuj profil użytkownika

### Eventy
- `GET /api/events` - Pobierz wszystkie eventy (z paginacją)
- `GET /api/events/:id` - Pobierz event po ID
- `POST /api/events` - Utwórz nowy event
- `PUT /api/events/:id` - Aktualizuj event
- `DELETE /api/events/:id` - Usuń event

### Produkty
- `GET /api/products` - Pobierz wszystkie produkty
- `GET /api/products/:id` - Pobierz produkt po ID
- `POST /api/products` - Utwórz nowy produkt
- `PUT /api/products/:id` - Aktualizuj produkt
- `DELETE /api/products/:id` - Usuń produkt

### Kwiaty
- `GET /api/flowers` - Pobierz wszystkie kwiaty
- `GET /api/flowers/:id` - Pobierz kwiat po ID
- `POST /api/flowers` - Utwórz nowy kwiat
- `PUT /api/flowers/:id` - Aktualizuj kwiat
- `DELETE /api/flowers/:id` - Usuń kwiat

### Pracownicy
- `GET /api/employees` - Pobierz wszystkich pracowników
- `GET /api/employees/:id` - Pobierz pracownika po ID
- `POST /api/employees` - Utwórz nowego pracownika
- `PUT /api/employees/:id` - Aktualizuj pracownika
- `DELETE /api/employees/:id` - Usuń pracownika

### Kontakty
- `GET /api/contacts` - Pobierz wszystkie kontakty
- `GET /api/contacts/:id` - Pobierz kontakt po ID
- `POST /api/contacts` - Utwórz nowy kontakt
- `PUT /api/contacts/:id` - Aktualizuj kontakt
- `DELETE /api/contacts/:id` - Usuń kontakt

### Samochody
- `GET /api/cars` - Pobierz wszystkie samochody
- `GET /api/cars/:id` - Pobierz samochód po ID
- `POST /api/cars` - Utwórz nowy samochód
- `PUT /api/cars/:id` - Aktualizuj samochód
- `DELETE /api/cars/:id` - Usuń samochód

### Typy kosztów
- `GET /api/cost-types` - Pobierz wszystkie typy kosztów
- `GET /api/cost-types/:id` - Pobierz typ kosztu po ID
- `POST /api/cost-types` - Utwórz nowy typ kosztu
- `PUT /api/cost-types/:id` - Aktualizuj typ kosztu
- `DELETE /api/cost-types/:id` - Usuń typ kosztu

### Koszty
- `GET /api/costs` - Pobierz wszystkie koszty
- `GET /api/costs/:id` - Pobierz koszt po ID
- `POST /api/costs` - Utwórz nowy koszt
- `PUT /api/costs/:id` - Aktualizuj koszt
- `DELETE /api/costs/:id` - Usuń koszt

### Chat
- `GET /api/chat` - Pobierz wiadomości czatu
- `POST /api/chat` - Wyślij wiadomość

### Powiadomienia
- `GET /api/notifications` - Pobierz powiadomienia użytkownika
- `POST /api/notifications` - Utwórz powiadomienie
- `PUT /api/notifications/:id/read` - Oznacz powiadomienie jako przeczytane

### Aktualizacje statusu
- `GET /api/status-updates` - Pobierz aktualizacje statusu
- `POST /api/status-updates` - Utwórz aktualizację statusu

## 🔐 Uwierzytelnianie

API używa tokenów JWT do uwierzytelniania. Dołącz token w nagłówku Authorization:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Przykłady żądań/odpowiedzi

### Logowanie
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@polishlus.com",
  "haslo": "password123"
}
```

Odpowiedź:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "imie": "Jan",
    "nazwisko": "Kowalski",
    "email": "admin@polishlus.com",
    "rola": "administrator",
    "avatar": "/images/avatars/avatar_01.png"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Pobierz eventy
```bash
GET /api/events?page=1&limit=10&status=planowany
Authorization: Bearer <token>
```

Odpowiedź:
```json
{
  "events": [
    {
      "id": 1,
      "numer": "WE-2024-001",
      "nazwa": "Eleganckie Wesele Vintage",
      "data": "2024-06-15",
      "lokalizacja": "Pałac w Warszawie",
      "status": "planowany",
      "opis": "Wesele w stylu retro"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🛠️ Development

### Migracje bazy danych
```bash
# Setup schematu bazy danych i migracja danych
cd backend
npm run setup

# Uruchom tylko migrację danych
npm run migrate
```

### Zmienne środowiskowe
- `PORT` - Port serwera (domyślnie: 5000)
- `NODE_ENV` - Środowisko (development/production)
- `DB_HOST` - Host PostgreSQL
- `DB_PORT` - Port PostgreSQL
- `DB_NAME` - Nazwa bazy danych
- `DB_USER` - Użytkownik bazy danych
- `DB_PASSWORD` - Hasło bazy danych
- `JWT_SECRET` - Sekret JWT
- `JWT_EXPIRES_IN` - Czas wygaśnięcia JWT
- `CORS_ORIGIN` - Dozwolone źródło CORS

## 🚀 Deployment

### Build produkcyjny
```bash
# Backend
cd backend
npm install --production
npm run start:prod

# Frontend
cd frontend
npm run build
```

### Konfiguracja środowiska produkcyjnego
1. Ustaw `NODE_ENV=production`
2. Skonfiguruj produkcyjną bazę danych
3. Ustaw bezpieczny `JWT_SECRET`
4. Skonfiguruj `CORS_ORIGIN` dla domeny produkcyjnej

### Docker (Opcjonalnie)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Backup/Restore bazy danych

### Backup
```bash
pg_dump -h localhost -U postgres -d polishlus_db > backup.sql
```

### Restore
```bash
psql -h localhost -U postgres -d polishlus_db < backup.sql
```

## 🤝 Contributing

1. Fork repozytorium
2. Utwórz branch: `git checkout -b feature/nazwa-funkcji`
3. Commit zmiany: `git commit -m 'Dodaj funkcję'`
4. Push do branch: `git push origin feature/nazwa-funkcji`
5. Otwórz Pull Request

## 📝 Licencja

Ten projekt jest dostępny na licencji MIT. Zobacz plik `LICENSE` dla szczegółów.

## 👨‍💻 Autor

Projekt został stworzony dla Polishlus - aplikacja do zarządzania procesami pakowania eventów.

---

**Poland** 🇵🇱 | **React** ⚛️ | **TypeScript** 📘 | **Node.js** 🟢 | **PostgreSQL** 🐘 | **CSS3** 🎨 