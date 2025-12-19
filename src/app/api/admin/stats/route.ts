import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get stats in parallel
    const [
      totalCustomers,
      totalWashers,
      totalBookings,
      pendingApplications,
      totalRevenue,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'WASHER', isApproved: true } }),
      prisma.booking.count(),
      prisma.washerApplication.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { platformFee: true },
      }),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalCustomers,
      totalWashers,
      totalBookings,
      pendingApplications,
      totalRevenue: totalRevenue._sum.platformFee || 0,
      recentBookings,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
