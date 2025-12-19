import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { calculateDistance } from '@/lib/haversine';

/**
 * POST /api/bookings/favorite-washers
 * Get washers that have previously served the customer with good ratings
 * Filters: COMPLETED bookings, rating >= 4 stars, currently available, within service radius
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const customerId = decoded.userId;
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Get completed bookings with reviews >= 4 stars
    const completedBookings = await prisma.booking.findMany({
      where: {
        customerId,
        status: 'COMPLETED',
        review: {
          rating: {
            gte: 4,
          },
        },
        washer: {
          isActive: true,
          isApproved: true,
          isAvailable: true,
          latitude: { not: null },
          longitude: { not: null },
        },
      },
      include: {
        review: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
        washer: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
            totalReviews: true,
            totalJobs: true,
            latitude: true,
            longitude: true,
            serviceRadius: true,
            profileImage: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (completedBookings.length === 0) {
      return NextResponse.json({
        washers: [],
        message: 'No tienes lavadores favoritos disponibles en este momento',
      });
    }

    // Group by washer and calculate stats
    const washerStats = new Map<string, {
      washer: any;
      servicesCount: number;
      averageRating: number;
      lastService: {
        date: Date;
        serviceName: string;
        rating: number;
      };
      totalRating: number;
    }>();

    completedBookings.forEach((booking) => {
      if (!booking.washer || !booking.review) return;

      const washerId = booking.washer.id;
      const existing = washerStats.get(washerId);

      if (existing) {
        existing.servicesCount += 1;
        existing.totalRating += booking.review.rating;
        existing.averageRating = existing.totalRating / existing.servicesCount;

        // Update last service if more recent
        if (booking.completedAt && booking.completedAt > existing.lastService.date) {
          existing.lastService = {
            date: booking.completedAt,
            serviceName: booking.service.name,
            rating: booking.review.rating,
          };
        }
      } else {
        washerStats.set(washerId, {
          washer: booking.washer,
          servicesCount: 1,
          averageRating: booking.review.rating,
          totalRating: booking.review.rating,
          lastService: {
            date: booking.completedAt!,
            serviceName: booking.service.name,
            rating: booking.review.rating,
          },
        });
      }
    });

    // Convert to array and filter by service radius
    const favoriteWashers = Array.from(washerStats.values())
      .map((stats) => {
        const distanceKm = calculateDistance(
          { latitude, longitude },
          { latitude: stats.washer.latitude!, longitude: stats.washer.longitude! }
        );

        // Skip if outside service radius
        if (distanceKm > stats.washer.serviceRadius) {
          return null;
        }

        return {
          id: stats.washer.id,
          name: stats.washer.name,
          email: stats.washer.email,
          rating: stats.washer.rating,
          totalReviews: stats.washer.totalReviews,
          totalJobs: stats.washer.totalJobs,
          profileImage: stats.washer.profileImage,
          phone: stats.washer.phone,
          distanceKm: Math.round(distanceKm * 10) / 10,
          // Customer-specific stats
          yourAverageRating: Math.round(stats.averageRating * 10) / 10,
          servicesWithYou: stats.servicesCount,
          lastService: {
            date: stats.lastService.date.toISOString(),
            serviceName: stats.lastService.serviceName,
            rating: stats.lastService.rating,
          },
        };
      })
      .filter((w) => w !== null);

    if (favoriteWashers.length === 0) {
      return NextResponse.json({
        washers: [],
        message: 'No tienes lavadores favoritos disponibles en este momento',
      });
    }

    // Sort by: average rating given (desc), then services count (desc)
    favoriteWashers.sort((a, b) => {
      if (b!.yourAverageRating !== a!.yourAverageRating) {
        return b!.yourAverageRating - a!.yourAverageRating;
      }
      return b!.servicesWithYou - a!.servicesWithYou;
    });

    return NextResponse.json({
      washers: favoriteWashers,
      message: null,
    });
  } catch (error) {
    console.error('Error getting favorite washers:', error);
    return NextResponse.json(
      { error: 'Failed to get favorite washers' },
      { status: 500 }
    );
  }
}
