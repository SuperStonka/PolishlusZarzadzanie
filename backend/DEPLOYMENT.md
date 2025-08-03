# 🚀 Deployment Guide - Polishlus Backend

## 📋 Hosting Configuration

### Database Details
- **Host**: `hosting2352919.online.pro`
- **Database**: `00887440_polishlus2`
- **Username**: `00887440_polishlus2`
- **Password**: `Lsu0!Tks12SX`
- **Port**: `5432`

## 🔧 Setup Steps

### 1. Environment Configuration

Create `.env` file in the backend directory:

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

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 2. Install Dependencies

```bash
cd backend
npm install --production
```

### 3. Setup Database

```bash
# Create database schema and migrate data
npm run setup:prod
```

### 4. Start Production Server

```bash
npm run start:prod
```

## 🌐 Hosting Provider Setup

### For cPanel/Shared Hosting:

1. **Upload Files**
   - Upload the entire `backend` folder to your hosting
   - Ensure Node.js is enabled on your hosting

2. **Set Environment Variables**
   - Create `.env` file with the configuration above
   - Update `CORS_ORIGIN` with your actual domain

3. **Database Connection**
   - The database is already configured on your hosting
   - Connection details are provided above

4. **Start Application**
   ```bash
   npm install --production
   npm run setup:prod
   npm run start:prod
   ```

### For VPS/Dedicated Hosting:

1. **SSH Access**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd polishlus-pakowanie/backend
   
   # Install dependencies
   npm install --production
   
   # Setup database
   npm run setup:prod
   
   # Start server
   npm run start:prod
   ```

2. **PM2 Process Manager (Recommended)**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start src/server.js --name "polishlus-backend"
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

## 🔍 Testing Deployment

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Polishlus API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Test Authentication
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@polishlus.com",
    "haslo": "password123"
  }'
```

### 3. Test Database Connection
```bash
curl https://your-domain.com/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify database credentials
   - Check if PostgreSQL is accessible from your hosting
   - Ensure database exists

2. **CORS Errors**
   - Update `CORS_ORIGIN` in `.env` with your frontend domain
   - Add multiple origins if needed: `http://localhost:3000,https://your-domain.com`

3. **Port Issues**
   - Some hosting providers use different ports
   - Check with your hosting provider for the correct port
   - Update `PORT` in `.env` if needed

4. **File Permissions**
   ```bash
   chmod 755 uploads/
   chmod 644 .env
   ```

### Logs:
```bash
# Check application logs
tail -f logs/app.log

# Check PM2 logs (if using PM2)
pm2 logs polishlus-backend
```

## 🔐 Security Considerations

1. **JWT Secret**
   - Change the default JWT secret in production
   - Use a strong, random string

2. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different secrets for development and production

3. **CORS Configuration**
   - Only allow trusted domains
   - Remove localhost from production CORS

4. **Database Security**
   - Use strong passwords
   - Limit database user permissions
   - Enable SSL connections if available

## 📊 Monitoring

### Health Check Endpoint
```bash
GET /api/health
```

### Database Status
```bash
# Check database connection
npm run setup:prod
```

## 🔄 Updates

### Deploying Updates:
1. Upload new files
2. Install dependencies: `npm install --production`
3. Restart application: `npm run start:prod`

### Database Migrations:
```bash
# Run migrations
npm run migrate
```

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify database connectivity
3. Test endpoints individually
4. Contact hosting provider for server-specific issues

---

**Polishlus Backend** - Ready for production deployment! 🚀 