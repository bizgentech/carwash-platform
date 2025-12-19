import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/washers - Get all washers
 */
export async function GET(request: NextRequest) {
  try {
    const washers = await prisma.user.findMany({
      where: { role: 'WASHER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isApproved: true,
        rating: true,
        totalJobs: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(washers);
  } catch (error) {
    console.error('Error fetching washers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch washers' },
      { status: 500 }
    );
  }
}
