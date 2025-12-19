/**
 * Script to create a COMPLETED booking without review for testing
 * Run with: npx ts-node scripts/create-test-booking.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Starting test booking creation...\n');

  // 1. Find customer
  const customer = await prisma.user.findUnique({
    where: { email: 'customer@demo.com' },
  });

  if (!customer) {
    console.error('❌ Customer not found: customer@demo.com');
    console.log('Creating customer account...');
    // Create customer if not exists
    const newCustomer = await prisma.user.create({
      data: {
        email: 'customer@demo.com',
        password: '$2a$10$YourHashedPasswordHere', // demo123 hashed
        name: 'Demo Customer',
        role: 'CUSTOMER',
        phone: '+1234567890',
      },
    });
    console.log('✅ Customer created:', newCustomer.email);
  } else {
    console.log('✅ Customer found:', customer.email);
  }

  // 2. Find washer
  const washer = await prisma.user.findUnique({
    where: { email: 'washer@demo.com' },
  });

  if (!washer) {
    console.error('❌ Washer not found: washer@demo.com');
    console.log('Please create a washer account first.');
    return;
  }
  console.log('✅ Washer found:', washer.email, `(Rating: ${washer.rating})`);

  // 3. Find a service
  const service = await prisma.service.findFirst({
    where: { isActive: true },
  });

  if (!service) {
    console.error('❌ No active services found');
    return;
  }
  console.log('✅ Service found:', service.name);

  // 4. Get or create vehicle for customer
  let vehicle = await prisma.vehicle.findFirst({
    where: { userId: customer?.id || '' },
  });

  if (!vehicle && customer) {
    vehicle = await prisma.vehicle.create({
      data: {
        userId: customer.id,
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        plateNumber: 'TEST123',
        size: 'MEDIUM',
        isDefault: true,
      },
    });
    console.log('✅ Vehicle created:', `${vehicle.year} ${vehicle.make} ${vehicle.model}`);
  } else if (vehicle) {
    console.log('✅ Vehicle found:', `${vehicle.year} ${vehicle.make} ${vehicle.model}`);
  }

  if (!customer || !vehicle) {
    console.error('❌ Missing customer or vehicle');
    return;
  }

  // 5. Get or create address for customer
  let address = await prisma.address.findFirst({
    where: { userId: customer.id },
  });

  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: customer.id,
        label: 'Home',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        latitude: 37.7749,
        longitude: -122.4194,
        isDefault: true,
      },
    });
    console.log('✅ Address created:', address.street);
  } else {
    console.log('✅ Address found:', address.street);
  }

  // 6. Check for existing COMPLETED bookings with reviews
  const completedBookingsWithReview = await prisma.booking.findMany({
    where: {
      customerId: customer.id,
      status: 'COMPLETED',
      review: {
        isNot: null,
      },
    },
    include: {
      review: true,
      service: true,
    },
  });

  if (completedBookingsWithReview.length > 0) {
    console.log(`\n📋 Found ${completedBookingsWithReview.length} COMPLETED booking(s) with review`);
    console.log('Removing review from first booking to use for testing...\n');

    const bookingToUpdate = completedBookingsWithReview[0];

    // Delete the review
    await prisma.review.delete({
      where: { id: bookingToUpdate.review!.id },
    });

    // Recalculate washer rating
    const remainingReviews = await prisma.review.findMany({
      where: { reviewedId: washer.id },
      select: { rating: true },
    });

    const newRating = remainingReviews.length > 0
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      : 0;

    await prisma.user.update({
      where: { id: washer.id },
      data: {
        rating: newRating,
        totalReviews: remainingReviews.length,
      },
    });

    console.log('✅ Review removed from booking:', bookingToUpdate.id);
    console.log('✅ Washer rating updated:', newRating.toFixed(2));
    console.log('\n📊 Test Booking Ready:');
    console.log('   Booking ID:', bookingToUpdate.id);
    console.log('   Service:', bookingToUpdate.service.name);
    console.log('   Status: COMPLETED');
    console.log('   Has Review: NO');
    console.log('\n🎉 You can now test the rating system!');
    return;
  }

  // 7. Create new COMPLETED booking without review
  console.log('\n📝 Creating new COMPLETED booking without review...\n');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(14, 0, 0, 0);

  const completedTime = new Date(yesterday);
  completedTime.setHours(15, 30, 0, 0);

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      washerId: washer.id,
      vehicleId: vehicle.id,
      serviceId: service.id,
      addressId: address.id,
      status: 'COMPLETED',
      scheduledFor: yesterday,
      startedAt: yesterday,
      completedAt: completedTime,
      price: service.basePrice,
      tip: 0,
      totalAmount: service.basePrice,
      customerNotes: 'Test booking for rating system',
    },
    include: {
      service: true,
      vehicle: true,
      washer: true,
    },
  });

  console.log('✅ Booking created successfully!\n');
  console.log('📊 Booking Details:');
  console.log('   ID:', booking.id);
  console.log('   Customer:', customer.email);
  console.log('   Washer:', washer.email, `(${washer.rating}⭐)`);
  console.log('   Service:', booking.service.name);
  console.log('   Vehicle:', `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`);
  console.log('   Status:', booking.status);
  console.log('   Scheduled:', booking.scheduledFor.toLocaleString());
  console.log('   Completed:', booking.completedAt?.toLocaleString());
  console.log('   Price: $' + booking.totalAmount);
  console.log('   Has Review: NO ✅');
  console.log('\n🎉 Test booking ready! You can now test the rating system.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
