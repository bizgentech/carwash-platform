# CarWash Pro - On-Demand Car Wash Platform

An Uber-style platform for on-demand car wash services. Customers can book professional car washers who come to their location with all equipment needed.

## 🚀 Features

### Customer Features
- Book car wash services at your location
- Choose from multiple service packages
- Real-time tracking of washers
- Secure payment via Stripe
- Rate and review washers
- Booking history

### Washer Features
- Register as independent contractor
- Accept/decline job requests
- GPS navigation to customers
- Upload before/after photos
- Track earnings
- Availability toggle

### Admin Features
- Approve washer registrations
- Manage users and bookings
- View transactions and analytics
- Handle disputes
- Manage advertising slots

## 💻 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Payments**: Stripe Connect (80/20 split)
- **Real-time**: Socket.io (ready for implementation)
- **Maps**: Google Maps API
- **Storage**: Cloudinary for images

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account
- Google Maps API key
- Cloudinary account (optional)

### Setup Steps

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
DATABASE_URL="postgresql://user:password@localhost:5432/carwash_db"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_GOOGLE_MAPS_KEY="your-google-maps-key"
```

3. **Set up database**
```bash
npx prisma generate
npx prisma db push
```

4. **Seed database (optional)**
```bash
npm run prisma:seed
```

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📱 User Flows

### Customer Flow
1. Register/Login
2. Add vehicle details
3. Select service package
4. Choose date/time and location
5. Washer accepts and arrives
6. Payment processed automatically
7. Rate the service

### Washer Flow
1. Apply as washer
2. Admin approves application
3. Complete Stripe Connect onboarding
4. Toggle availability ON
5. Receive job notifications
6. Accept/decline jobs
7. Navigate to customer
8. Complete service
9. Upload photos
10. Receive payment (80% of service fee)

## 💳 Payment Flow

- Customer pays full amount via Stripe
- Platform takes 20% commission
- Washer receives 80% + 100% tips
- Automatic transfers via Stripe Connect

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Traditional Hosting
```bash
npm run build
npm start
```

## 📊 Database Schema

Key tables:
- **Users**: Customers, Washers, Admins
- **Bookings**: Service requests
- **Services**: Package types and pricing
- **Payments**: Transaction records
- **Reviews**: Ratings and feedback
- **Vehicles**: Customer cars
- **Notifications**: Push notifications

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Bookings
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking

### Payments
- `POST /api/payments/process` - Process payment
- `POST /api/payments/refund` - Issue refund

## 📈 Future Enhancements

- [ ] Mobile apps (React Native)
- [ ] Real-time chat
- [ ] Fleet management for businesses
- [ ] Subscription plans
- [ ] Dynamic pricing
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Washer route optimization
- [ ] Loyalty program
- [ ] WhatsApp integration

## 🤝 Marketing Strategy

1. **WhatsApp Groups**: Direct promotion to car washer networks
2. **Local SEO**: Google Maps optimization
3. **Referral Program**: $5 credit for referrals
4. **Social Media**: Instagram/Facebook local ads
5. **Partnerships**: Gas stations, parking lots
6. **QR Codes**: Washers place on equipment

## 📄 License

MIT License

## 👤 Contact

For questions or support, contact the development team.

---

**Note**: This is an MVP version. Additional features and optimizations will be added based on user feedback and business requirements.
