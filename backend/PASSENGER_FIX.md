# 🔧 Naprawa błędu Phusion Passenger

## 🚨 Problem
Backend nie uruchamia się na serwerze z błędem:
```
Web application could not be started by the Phusion Passenger(R) application server.
```

## ✅ Rozwiązanie

### 1. Upload plików na serwer
```bash
# Upload cały folder backend na serwer
# Ścieżka: /home/00887440/domains/polishlus.arstudio.atthost24.pl/public_html/backend/
```

### 2. Ustaw uprawnienia
```bash
chmod 755 uploads/
chmod 755 tmp/
chmod 644 .env
chmod 644 Passengerfile.json
chmod 644 .htaccess
```

### 3. Zainstaluj zależności
```bash
cd /home/00887440/domains/polishlus.arstudio.atthost24.pl/public_html/backend/
npm install --production
```

### 4. Utwórz plik .env
```bash
cat > .env << EOF
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
CORS_ORIGIN=http://polishlus.arstudio.atthost24.pl,http://localhost:3000

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
EOF
```

### 5. Uruchom setup bazy danych
```bash
npm run setup:prod
```

### 6. Restart Passenger
```bash
touch tmp/restart.txt
```

### 7. Sprawdź logi
```bash
tail -f passenger.log
```

## 🔍 Diagnostyka

### Sprawdź logi Passenger
```bash
# Logi aplikacji
tail -f passenger.log

# Logi błędów
tail -f error.log
```

### Test połączenia z bazą danych
```bash
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: 'hosting2352919.online.pro',
  port: 5432,
  database: '00887440_polishlus2',
  user: '00887440_polishlus2',
  password: 'Lsu0!Tks12SX'
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('DB Error:', err);
  else console.log('DB OK:', res.rows[0]);
  process.exit();
});
"
```

### Test API
```bash
curl http://polishlus.arstudio.atthost24.pl/api/health
```

## 🚀 Pliki konfiguracyjne

### Passengerfile.json
```json
{
  "app_type": "node",
  "startup_file": "src/server.js",
  "environment": "production",
  "port": 5000,
  "user": "nobody",
  "node_path": "/usr/bin/node",
  "log_file": "passenger.log",
  "max_pool_size": 6,
  "min_instances": 1,
  "spawn_method": "smart",
  "restart_dir": "tmp",
  "restart_file": "restart.txt"
}
```

### .htaccess
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ /index.html [QSA,L]

PassengerNodejs /usr/bin/node
PassengerAppRoot /home/00887440/domains/polishlus.arstudio.atthost24.pl/public_html/backend
PassengerAppType node
PassengerStartupFile src/server.js
PassengerAppEnv production
PassengerLogFile /home/00887440/domains/polishlus.arstudio.atthost24.pl/public_html/backend/passenger.log

Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

Header always set Access-Control-Allow-Origin "http://polishlus.arstudio.atthost24.pl"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
Header always set Access-Control-Allow-Credentials "true"
```

## 📞 Wsparcie

Jeśli problem nadal występuje:
1. Sprawdź logi Passenger
2. Sprawdź połączenie z bazą danych
3. Sprawdź uprawnienia plików
4. Skontaktuj się z hostingiem

---

**Polishlus Backend** - Naprawa Phusion Passenger ✅ 