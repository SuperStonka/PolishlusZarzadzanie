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
CORS_ORIGIN=https://your-domain.com

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

echo "✅ Created uploads directory"

# Setup database
echo "🗄️ Setting up database..."
npm run setup:prod

echo "✅ Database setup completed"

echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update CORS_ORIGIN in .env with your actual domain"
echo "2. Start the server: npm run start:prod"
echo "3. Test the API: curl https://your-domain.com/api/health" 