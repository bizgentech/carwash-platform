# 🚀 CarWash Pro - Deployment Guide

## Quick Start (Local Development)

1. **Extract the archive**
```bash
tar -xzf carwash-platform.tar.gz
cd carwash-platform
```

2. **Run setup script**
```bash
chmod +x setup.sh
./setup.sh
```

Or manually:
```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma generate
npx prisma db push
npm run prisma:seed  # Optional: Add demo data
npm run dev
```

3. **Access the platform**
- Homepage: http://localhost:3000
- Customer Dashboard: http://localhost:3000/customer/dashboard
- Washer Dashboard: http://localhost:3000/washer/dashboard
- Admin Panel: http://localhost:3000/admin/dashboard

## Required API Keys

### 1. PostgreSQL Database
- Local: Use PostgreSQL 14+
- Cloud: Supabase, Neon, or Railway (free tiers available)

### 2. Stripe (Payments)
- Create account at https://stripe.com
- Get test keys from Dashboard > Developers > API keys
- Enable Stripe Connect for washer payouts

### 3. Google Maps
- Go to https://console.cloud.google.com
- Create project and enable Maps JavaScript API
- Create API key with restrictions

### 4. Cloudinary (Optional - for images)
- Sign up at https://cloudinary.com
- Get cloud name and API keys from dashboard

## Production Deployment

### Option 1: Vercel (Recommended - Free)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. Deploy on Vercel:
- Go to https://vercel.com
- Import GitHub repository
- Add environment variables
- Deploy!

### Option 2: Railway (Database + App)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Deploy:
```bash
railway login
railway init
railway add postgresql
railway up
railway domain
```

### Option 3: Traditional VPS

1. Setup server (Ubuntu 22.04):
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
npm install -g pm2
```

2. Deploy application:
```bash
# Clone your repo
git clone YOUR_REPO_URL
cd carwash-platform

# Install and build
npm install
npm run build

# Setup database
npx prisma generate
npx prisma db push

# Start with PM2
pm2 start npm --name "carwash" -- start
pm2 save
pm2 startup
```

3. Setup Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

```env
# Production Database (use connection pooling)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Security (generate strong keys)
JWT_SECRET="use-openssl-rand-base64-32"
NEXTAUTH_SECRET="use-openssl-rand-base64-32"

# Stripe (use live keys)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Domain
NEXTAUTH_URL="https://yourdomain.com"
```

## Post-Deployment Checklist

- [ ] SSL certificate (Let's Encrypt)
- [ ] Database backups configured
- [ ] Environment variables secured
- [ ] Stripe webhooks configured
- [ ] Google Maps domain restrictions
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Terms of Service & Privacy Policy
- [ ] Admin account created
- [ ] Test payment flow
- [ ] Mobile responsiveness tested

## Monitoring & Maintenance

### Database
```bash
# Backup
pg_dump carwash_db > backup.sql

# Restore
psql carwash_db < backup.sql

# Migrations
npx prisma migrate dev
npx prisma migrate deploy
```

### Application
```bash
# View logs
pm2 logs carwash

# Restart
pm2 restart carwash

# Monitor
pm2 monit
```

## Scaling Considerations

1. **Database**: Use connection pooling and read replicas
2. **Images**: Use CDN (Cloudflare, CloudFront)
3. **Caching**: Implement Redis for sessions
4. **Queue**: Add job queue for notifications
5. **Monitoring**: Use DataDog or New Relic

## Security Best Practices

1. Enable rate limiting
2. Implement CORS properly
3. Use helmet.js for headers
4. Sanitize all inputs
5. Regular dependency updates
6. Implement 2FA for admins
7. Log all transactions
8. Regular security audits

## Support

For issues or questions:
- Check logs: `npm run dev` or `pm2 logs`
- Database issues: `npx prisma studio`
- Reset database: `npx prisma db push --force-reset`

Good luck with your deployment! 🎉
