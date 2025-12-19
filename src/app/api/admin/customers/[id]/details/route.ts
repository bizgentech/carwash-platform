import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/customers/[id]/details - Get detailed customer information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

    const customer = await prisma.user.findUnique({
      where: { id: customerId, role: 'CUSTOMER' },
      include: {
        vehicles: true,
        addresses: true,
        bookingsAsCustomer: {
          include: {
            washer: { select: { name: true, rating: true } },
            service: { select: { name: true, type: true } },
            vehicle: { select: { make: true, model: true, year: true } },
            address: { select: { street: true, city: true, state: true } },
            payment: true,
            review: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        customerPayments: {
          include: {
            booking: {
              include: {
                service: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        reviewsGiven: {
          include: {
            reviewed: { select: { name: true } },
            booking: {
              include: {
                service: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const completedBookings = customer.bookingsAsCustomer.filter(
      b => b.status === 'COMPLETED'
    ).length;

    const totalSpent = customer.customerPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    const cancelledBookings = customer.bookingsAsCustomer.filter(
      b => b.status === 'CANCELLED'
    ).length;

    const pendingBookings = customer.bookingsAsCustomer.filter(
      b => ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(b.status)
    ).length;

    // Bookings by month (last 6 months)
    const bookingsByMonth = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('es', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;

      const count = customer.bookingsAsCustomer.filter(b => {
        const bookingDate = new Date(b.scheduledFor);
        return bookingDate.getFullYear() === year &&
               bookingDate.getMonth() + 1 === monthNum;
      }).length;

      const spent = customer.customerPayments.filter(p => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate.getFullYear() === year &&
               paymentDate.getMonth() + 1 === monthNum &&
               p.status === 'COMPLETED';
      }).reduce((sum, p) => sum + p.amount, 0);

      bookingsByMonth.push({ month, bookings: count, spent });
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isActive: customer.isActive,
        emailVerified: customer.emailVerified,
        createdAt: customer.createdAt,
      },
      vehicles: customer.vehicles,
      addresses: customer.addresses,
      stats: {
        totalBookings: customer.bookingsAsCustomer.length,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        totalSpent,
        averageBookingValue: completedBookings > 0 ? (totalSpent / completedBookings).toFixed(2) : '0',
        totalReviews: customer.reviewsGiven.length,
      },
      bookings: customer.bookingsAsCustomer,
      payments: customer.customerPayments,
      reviews: customer.reviewsGiven,
      bookingsByMonth,
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer details' },
      { status: 500 }
    );
  }
}
