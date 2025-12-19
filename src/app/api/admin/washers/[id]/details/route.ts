import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/washers/[id]/details - Get detailed washer information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const washerId = params.id;

    // Get washer with all related data
    const washer = await prisma.user.findUnique({
      where: { id: washerId, role: 'WASHER' },
      include: {
        bookingsAsWasher: {
          include: {
            customer: { select: { name: true, email: true } },
            service: { select: { name: true } },
            vehicle: { select: { make: true, model: true } },
            payment: true,
            review: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        washerPayments: {
          include: {
            booking: {
              include: {
                service: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        earnings: {
          orderBy: { year: 'desc', month: 'desc' },
          take: 12,
        },
        reviewsReceived: {
          include: {
            reviewer: { select: { name: true } },
            booking: { select: { scheduledFor: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!washer) {
      return NextResponse.json(
        { error: 'Washer not found' },
        { status: 404 }
      );
    }

    // Get washer application if exists
    const application = await prisma.washerApplication.findFirst({
      where: { email: washer.email },
    });

    // Calculate stats
    const completedJobs = washer.bookingsAsWasher.filter(b => b.status === 'COMPLETED').length;
    const totalEarnings = washer.washerPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.washerAmount + p.tip, 0);

    const cancelledJobs = washer.bookingsAsWasher.filter(b => b.status === 'CANCELLED').length;
    const completionRate = washer.totalJobs > 0
      ? ((completedJobs / washer.totalJobs) * 100).toFixed(1)
      : '0';

    // Jobs by month for chart (last 6 months)
    const jobsByMonth = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('es', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;

      const jobsCount = washer.bookingsAsWasher.filter(b => {
        const bookingDate = new Date(b.scheduledFor);
        return bookingDate.getFullYear() === year &&
               bookingDate.getMonth() + 1 === monthNum &&
               b.status === 'COMPLETED';
      }).length;

      jobsByMonth.push({ month, jobs: jobsCount });
    }

    return NextResponse.json({
      washer: {
        id: washer.id,
        name: washer.name,
        email: washer.email,
        phone: washer.phone,
        isActive: washer.isActive,
        isApproved: washer.isApproved,
        isAvailable: washer.isAvailable,
        rating: washer.rating,
        totalJobs: washer.totalJobs,
        createdAt: washer.createdAt,
      },
      application,
      stats: {
        completedJobs,
        totalEarnings,
        cancelledJobs,
        completionRate,
        averageRating: washer.rating,
        totalReviews: washer.reviewsReceived.length,
      },
      recentBookings: washer.bookingsAsWasher.slice(0, 10),
      payments: washer.washerPayments,
      earnings: washer.earnings,
      reviews: washer.reviewsReceived,
      jobsByMonth,
    });
  } catch (error) {
    console.error('Error fetching washer details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch washer details' },
      { status: 500 }
    );
  }
}
