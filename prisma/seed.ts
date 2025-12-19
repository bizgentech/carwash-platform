import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo users
  const customerPassword = await hashPassword('demo123')
  const washerPassword = await hashPassword('demo123')
  const adminPassword = await hashPassword('demo123')

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      phone: '555-0100',
      emailVerified: true,
      isActive: true,
    },
  })

  // Create customer
  const customer = await prisma.user.create({
    data: {
      email: 'customer@demo.com',
      password: customerPassword,
      name: 'John Customer',
      role: 'CUSTOMER',
      phone: '555-0101',
      emailVerified: true,
      isActive: true,
    },
  })

  // Create washer
  const washer = await prisma.user.create({
    data: {
      email: 'washer@demo.com',
      password: washerPassword,
      name: 'Mike Washer',
      role: 'WASHER',
      phone: '555-0102',
      emailVerified: true,
      isActive: true,
      isApproved: true,
      documentsVerified: true,
      isAvailable: true,
      rating: 4.8,
      totalJobs: 45,
      latitude: 26.1224,
      longitude: -80.1373, // Hollywood, FL coordinates
    },
  })

  // Create another washer
  const washer2 = await prisma.user.create({
    data: {
      email: 'washer2@demo.com',
      password: washerPassword,
      name: 'Sarah Clean',
      role: 'WASHER',
      phone: '555-0103',
      emailVerified: true,
      isActive: true,
      isApproved: true,
      documentsVerified: true,
      isAvailable: true,
      rating: 4.9,
      totalJobs: 120,
      latitude: 26.0112,
      longitude: -80.1495, // Fort Lauderdale area
    },
  })

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Basic Wash',
        type: 'BASIC',
        description: 'Exterior wash with tire shine and window cleaning',
        basePrice: 30,
        duration: 30,
        features: ['Exterior wash', 'Tire shine', 'Window cleaning', 'Quick dry'],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Standard Wash',
        type: 'STANDARD',
        description: 'Complete wash with interior vacuum and dashboard cleaning',
        basePrice: 50,
        duration: 45,
        features: ['Everything in Basic', 'Interior vacuum', 'Dashboard wipe', 'Air freshener'],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Premium Detail',
        type: 'PREMIUM',
        description: 'Deep clean with leather conditioning and wax protection',
        basePrice: 80,
        duration: 60,
        features: ['Everything in Standard', 'Leather conditioning', 'Deep clean', 'Wax protection'],
      },
    }),
    prisma.service.create({
      data: {
        name: 'Full Detailing',
        type: 'DETAILING',
        description: 'Complete interior and exterior restoration',
        basePrice: 120,
        duration: 90,
        features: ['Complete interior detail', 'Paint protection', 'Engine bay cleaning', 'Full restoration'],
      },
    }),
  ])

  // Create vehicles for customer
  const vehicle = await prisma.vehicle.create({
    data: {
      userId: customer.id,
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      plateNumber: 'ABC123',
      size: 'MEDIUM',
      isDefault: true,
    },
  })

  // Create address for customer
  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'Home',
      street: '123 Ocean Drive',
      city: 'Hollywood',
      state: 'FL',
      zipCode: '33019',
      latitude: 26.0112,
      longitude: -80.1495,
      isDefault: true,
    },
  })

  // Create sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer.id,
      washerId: washer.id,
      vehicleId: vehicle.id,
      serviceId: services[1].id, // Standard Wash
      addressId: address.id,
      status: 'COMPLETED',
      scheduledFor: new Date('2024-01-15T10:00:00'),
      startedAt: new Date('2024-01-15T10:05:00'),
      completedAt: new Date('2024-01-15T10:50:00'),
      price: 50,
      tip: 10,
      totalAmount: 60,
      customerNotes: 'Please be careful with the leather seats',
      washerNotes: 'Service completed successfully',
    },
  })

  const booking2 = await prisma.booking.create({
    data: {
      customerId: customer.id,
      washerId: washer2.id,
      vehicleId: vehicle.id,
      serviceId: services[2].id, // Premium Detail
      addressId: address.id,
      status: 'COMPLETED',
      scheduledFor: new Date('2024-01-20T14:00:00'),
      startedAt: new Date('2024-01-20T14:10:00'),
      completedAt: new Date('2024-01-20T15:10:00'),
      price: 80,
      tip: 15,
      totalAmount: 95,
    },
  })

  // Create upcoming booking
  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer.id,
      washerId: washer.id,
      vehicleId: vehicle.id,
      serviceId: services[0].id, // Basic Wash
      addressId: address.id,
      status: 'ACCEPTED',
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      price: 30,
      tip: 0,
      totalAmount: 30,
    },
  })

  // Create reviews for completed bookings
  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      reviewerId: customer.id,
      reviewedId: washer.id,
      rating: 5,
      comment: 'Excellent service! My car looks brand new.',
    },
  })

  await prisma.review.create({
    data: {
      bookingId: booking2.id,
      reviewerId: customer.id,
      reviewedId: washer2.id,
      rating: 5,
      comment: 'Very professional and thorough. Highly recommended!',
    },
  })

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: customer.id,
      bookingId: booking3.id,
      title: 'Booking Confirmed',
      message: 'Your car wash has been confirmed for ' + booking3.scheduledFor.toLocaleDateString(),
      type: 'BOOKING',
      isRead: false,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('Demo accounts created:')
  console.log('  Admin: admin@demo.com / demo123')
  console.log('  Customer: customer@demo.com / demo123')
  console.log('  Washer: washer@demo.com / demo123')
  console.log('  Washer2: washer2@demo.com / demo123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
