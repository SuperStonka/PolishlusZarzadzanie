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

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS3 z custom properties
- **Ikony**: Lucide React
- **Animacje**: CSS Keyframes
- **Dane**: JSON (mock data)

## 📦 Instalacja

1. **Sklonuj repozytorium**
```bash
git clone https://github.com/your-username/polishlus-pakowanie.git
cd polishlus-pakowanie
```

2. **Zainstaluj zależności**
```bash
cd frontend
npm install
```

3. **Uruchom aplikację**
```bash
npm start
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## 📁 Struktura projektu

```
frontend/
├── public/
│   ├── data/           # Mock dane JSON
│   ├── images/         # Obrazy produktów
│   └── index.html
├── src/
│   ├── components/     # Komponenty UI
│   ├── events/         # Komponenty eventów
│   ├── layout/         # Layout aplikacji
│   ├── listy/          # Listy zarządzania
│   ├── pages/          # Strony aplikacji
│   ├── styles/         # Style CSS
│   └── utils/          # Narzędzia
└── package.json
```

## 🎨 Style i Design

Aplikacja używa custom CSS z:
- **CSS Variables** dla spójności kolorów
- **Flexbox** i **Grid** dla layoutu
- **Animacje CSS** dla interaktywności
- **Responsive design** dla różnych urządzeń

## 🔧 Konfiguracja

### Zmienne CSS
Główne kolory i style są zdefiniowane w `src/styles/App.css`:
```css
:root {
  --primary-color: #7367f0;
  --success-color: #28c76f;
  --warning-color: #ff9f43;
  --danger-color: #ea5455;
  /* ... więcej zmiennych */
}
```

### Mock Data
Dane są przechowywane w plikach JSON w `public/data/`:
- `eventy.json` - eventy
- `uzytkownicy.json` - użytkownicy
- `produkty.json` - produkty
- `koszty-eventow.json` - koszty eventów
- i inne...

## 🚀 Deployment

### Build produkcyjny
```bash
npm run build
```

### Deploy na GitHub Pages
1. Zbuduj aplikację: `npm run build`
2. Skopiuj zawartość `build/` do `docs/`
3. Włącz GitHub Pages w ustawieniach repozytorium

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

**Poland** 🇵🇱 | **React** ⚛️ | **TypeScript** 📘 | **CSS3** 🎨 