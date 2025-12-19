import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/finance/stats - Get financial statistics
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last3MonthsStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    // Get all completed payments
    const [
      thisMonthPayments,
      last3MonthsPayments,
      thisYearPayments,
      allPayments,
      pendingPayments,
    ] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          paidAt: { gte: thisMonthStart },
        },
        select: {
          amount: true,
          platformFee: true,
          washerAmount: true,
          tip: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          paidAt: { gte: last3MonthsStart },
        },
        select: {
          amount: true,
          platformFee: true,
          washerAmount: true,
          tip: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          paidAt: { gte: thisYearStart },
        },
        select: {
          amount: true,
          platformFee: true,
          washerAmount: true,
          tip: true,
          paidAt: true,
        },
      }),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: {
          amount: true,
          platformFee: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          status: 'PENDING',
        },
        select: {
          washerAmount: true,
          tip: true,
          washer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // Calculate totals
    const calculateTotals = (payments: any[]) => ({
      revenue: payments.reduce((sum, p) => sum + p.amount, 0),
      commission: payments.reduce((sum, p) => sum + p.platformFee, 0),
      washerEarnings: payments.reduce((sum, p) => sum + (p.washerAmount || 0) + (p.tip || 0), 0),
    });

    const thisMonth = calculateTotals(thisMonthPayments);
    const last3Months = calculateTotals(last3MonthsPayments);
    const thisYear = calculateTotals(thisYearPayments);
    const allTime = calculateTotals(allPayments);

    // Revenue by month (last 12 months)
    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('es', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;

      const monthPayments = thisYearPayments.filter(p => {
        if (!p.paidAt) return false;
        const paymentDate = new Date(p.paidAt);
        return paymentDate.getFullYear() === year &&
               paymentDate.getMonth() + 1 === monthNum;
      });

      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      const commission = monthPayments.reduce((sum, p) => sum + p.platformFee, 0);

      revenueByMonth.push({ month, revenue, commission });
    }

    // Pending payments to washers
    const pendingByWasher = pendingPayments.reduce((acc: any, payment) => {
      if (!payment.washer) return acc;

      const washerId = payment.washer.id;
      if (!acc[washerId]) {
        acc[washerId] = {
          washerId,
          washerName: payment.washer.name,
          totalPending: 0,
          count: 0,
        };
      }

      acc[washerId].totalPending += payment.washerAmount + payment.tip;
      acc[washerId].count += 1;

      return acc;
    }, {});

    const pendingPaymentsList = Object.values(pendingByWasher);

    return NextResponse.json({
      thisMonth,
      last3Months,
      thisYear,
      allTime,
      revenueByMonth,
      pendingPayments: {
        total: pendingPayments.reduce((sum, p) => sum + p.washerAmount + p.tip, 0),
        count: pendingPayments.length,
        byWasher: pendingPaymentsList,
      },
    });
  } catch (error) {
    console.error('Error fetching finance stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finance stats' },
      { status: 500 }
    );
  }
}
