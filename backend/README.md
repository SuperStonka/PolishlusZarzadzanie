# Polishlus Backend API

Backend API for the Polishlus packing application built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: PostgreSQL with comprehensive schema for all entities
- **API**: RESTful API with proper error handling and validation
- **File Upload**: Support for image uploads in chat messages
- **Real-time**: Ready for WebSocket integration
- **Security**: CORS, input validation, and secure headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Validation**: Built-in Express validation

## 📦 Installation

### Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** or **yarn**

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd polishlus-pakowanie/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp env.example .env
```

Edit `.env` file with your configuration:
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

4. **Create PostgreSQL database**
```sql
CREATE DATABASE polishlus_db;
```

5. **Setup database schema and migrate data**
```bash
npm run setup
```

This will:
- Create all database tables
- Migrate sample data from JSON files
- Set up indexes and triggers

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The API will be available at `http://localhost:5000`

## 📊 Database Schema

### Core Tables
- **users** - User accounts and authentication
- **eventy** - Events and projects
- **produkty** - Products inventory
- **kwiaty** - Flowers inventory
- **pracownicy** - Employees
- **kontakty** - Contacts
- **samochody** - Vehicle fleet
- **wypozyczalnie** - Rental companies

### Junction Tables
- **produkty_w_eventach** - Products assigned to events
- **kwiaty_w_eventach** - Flowers assigned to events
- **koszty_eventow** - Event cost calculations
- **wiadomosci_chat** - Chat messages
- **powiadomienia** - System notifications

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify JWT token

### Events
- `GET /api/events` - Get all events (with pagination)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/calendar/:startDate/:endDate` - Get events by date range
- `GET /api/events/:id/stats` - Get event statistics

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Flowers
- `GET /api/flowers` - Get all flowers
- `GET /api/flowers/:id` - Get flower by ID
- `POST /api/flowers` - Create new flower
- `PUT /api/flowers/:id` - Update flower
- `DELETE /api/flowers/:id` - Delete flower

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Contacts
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Cost Types
- `GET /api/cost-types` - Get all cost types
- `GET /api/cost-types/:id` - Get cost type by ID
- `POST /api/cost-types` - Create new cost type
- `PUT /api/cost-types/:id` - Update cost type
- `DELETE /api/cost-types/:id` - Delete cost type

### Costs
- `GET /api/costs` - Get all costs
- `GET /api/costs/:id` - Get cost by ID
- `POST /api/costs` - Create new cost
- `PUT /api/costs/:id` - Update cost
- `DELETE /api/costs/:id` - Delete cost

### Chat
- `GET /api/chat` - Get chat messages
- `POST /api/chat` - Send message
- `GET /api/chat/:eventId` - Get event chat messages

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark notification as read

### Status Updates
- `GET /api/status-updates` - Get status updates
- `POST /api/status-updates` - Create status update

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request/Response Examples

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@polishlus.com",
  "haslo": "password123"
}
```

Response:
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

### Get Events
```bash
GET /api/events?page=1&limit=10&status=planowany
Authorization: Bearer <token>
```

Response:
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

### Database Migrations
```bash
# Setup database schema and migrate data
npm run setup

# Run only data migration
npm run migrate
```

### Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `CORS_ORIGIN` - Allowed CORS origin

## 🚀 Deployment

### Production Build
```bash
npm install --production
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET`
4. Configure `CORS_ORIGIN` for production domain

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Database Backup/Restore

### Backup
```bash
pg_dump -h localhost -U postgres -d polishlus_db > backup.sql
```

### Restore
```bash
psql -h localhost -U postgres -d polishlus_db < backup.sql
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

---

**Polishlus Backend API** - Built with ❤️ for event packing management 