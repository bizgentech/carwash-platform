#!/bin/bash

echo "🚗 CarWash Pro - Platform Setup Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your credentials before continuing."
    echo ""
    read -p "Press enter when you've updated .env file..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "📊 Setting up database..."
read -p "Is your PostgreSQL database ready? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db push
    echo "✅ Database schema pushed!"
else
    echo "⚠️  Skipping database setup. Run 'npx prisma db push' when ready."
fi

echo ""
echo "======================================"
echo "✨ Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Default URLs:"
echo "  🌐 Homepage: http://localhost:3000"
echo "  👤 Customer Login: http://localhost:3000/login"
echo "  🚗 Washer Registration: http://localhost:3000/washer/register"
echo "  👨‍💼 Admin Dashboard: http://localhost:3000/admin/dashboard"
echo ""
echo "Demo Credentials:"
echo "  Customer: customer@demo.com / demo123"
echo "  Washer: washer@demo.com / demo123"
echo "  Admin: admin@demo.com / demo123"
echo ""
echo "Happy washing! 🧼✨"
