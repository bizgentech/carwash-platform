import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/finance/reports - Get financial reports
 */
export async function GET(request: NextRequest) {
  try {
    // Top washers by earnings
    const topWashers = await prisma.user.findMany({
      where: { role: 'WASHER', isApproved: true },
      select: {
        id: true,
        name: true,
        email: true,
        rating: true,
        totalJobs: true,
        washerPayments: {
          where: { status: 'COMPLETED' },
          select: {
            washerAmount: true,
            tip: true,
          },
        },
      },
      orderBy: { totalJobs: 'desc' },
      take: 10,
    });

    const topWashersWithEarnings = topWashers.map(washer => ({
      id: washer.id,
      name: washer.name,
      email: washer.email,
      rating: washer.rating,
      totalJobs: washer.totalJobs,
      totalEarnings: washer.washerPayments.reduce(
        (sum, p) => sum + p.washerAmount + p.tip,
        0
      ),
    })).sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Top customers by spending
    const topCustomers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        customerPayments: {
          where: { status: 'COMPLETED' },
          select: {
            amount: true,
          },
        },
        bookingsAsCustomer: {
          where: { status: 'COMPLETED' },
        },
      },
      take: 100, // Get more to sort properly
    });

    const topCustomersWithSpending = topCustomers
      .map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalBookings: customer.bookingsAsCustomer.length,
        totalSpent: customer.customerPayments.reduce((sum, p) => sum + p.amount, 0),
      }))
      .filter(c => c.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Most popular services
    const services = await prisma.service.findMany({
      include: {
        bookings: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    const popularServices = services
      .map(service => ({
        id: service.id,
        name: service.name,
        type: service.type,
        basePrice: service.basePrice,
        totalBookings: service.bookings.length,
        revenue: service.bookings.reduce((sum, b) => sum + b.price, 0),
      }))
      .sort((a, b) => b.totalBookings - a.totalBookings);

    return NextResponse.json({
      topWashers: topWashersWithEarnings,
      topCustomers: topCustomersWithSpending,
      popularServices,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
