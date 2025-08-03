#!/bin/bash

echo "🚀 Setting up Polishlus Backend for hosting..."

# Create .env file with hosting configuration
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

echo "✅ Created .env file with hosting configuration"

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Create tmp directory for Passenger
mkdir -p tmp
chmod 755 tmp

echo "✅ Created uploads and tmp directories"

# Setup database
echo "🗄️ Setting up database..."
npm run setup:prod

echo "✅ Database setup completed"

echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Upload files to hosting"
echo "2. Set file permissions: chmod 755 uploads/ tmp/"
echo "3. Restart Passenger: touch tmp/restart.txt"
echo "4. Test the API: curl http://polishlus.arstudio.atthost24.pl/api/health" 