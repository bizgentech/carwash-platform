import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDistance, calculateMatchScore, sortWashersByScore, type WasherWithDistance } from '@/lib/haversine';

/**
 * POST /api/bookings/match-washers - Find and rank available washers for a booking
 *
 * Algorithm:
 * 1. Filter washers (APPROVED, isAvailable: true, within serviceRadius)
 * 2. Calculate distance using Haversine formula
 * 3. Calculate match score: (rating * 0.7) + (proximity * 0.3)
 * 4. Return top washers sorted by score
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, limit = 5 } = body;

    // Validate input
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      );
    }

    // Get all available and approved washers with location
    const washers = await prisma.user.findMany({
      where: {
        role: 'WASHER',
        isApproved: true,
        isAvailable: true,
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        latitude: true,
        longitude: true,
        serviceRadius: true,
        rating: true,
        totalJobs: true,
        totalReviews: true,
        lastLocationUpdate: true,
        reviewsReceived: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (washers.length === 0) {
      return NextResponse.json({
        washers: [],
        message: 'No washers available at this time',
      });
    }

    // Service location
    const serviceLocation = { latitude, longitude };

    // Calculate distance and score for each washer
    const washersWithScore: WasherWithDistance[] = washers
      .map(washer => {
        // Skip washers without coordinates
        if (!washer.latitude || !washer.longitude) {
          return null;
        }

        const washerLocation = {
          latitude: washer.latitude,
          longitude: washer.longitude,
        };

        // Calculate distance
        const distanceKm = calculateDistance(serviceLocation, washerLocation);

        // Check if within washer's service radius
        if (distanceKm > washer.serviceRadius) {
          return null; // Skip washers outside their service radius
        }

        // Calculate match score
        const score = calculateMatchScore(washer.rating, distanceKm);

        return {
          id: washer.id,
          name: washer.name,
          email: washer.email,
          phone: washer.phone,
          profileImage: washer.profileImage,
          rating: washer.rating,
          totalJobs: washer.totalJobs,
          totalReviews: washer.totalReviews,
          distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
          score: Math.round(score * 100) / 100, // Round to 2 decimals
          lastLocationUpdate: washer.lastLocationUpdate,
          recentReviews: washer.reviewsReceived,
          latitude: washer.latitude,
          longitude: washer.longitude,
        };
      })
      .filter((w): w is WasherWithDistance => w !== null);

    if (washersWithScore.length === 0) {
      return NextResponse.json({
        washers: [],
        message: 'No washers available within service radius',
      });
    }

    // Sort by score and limit results
    const topWashers = sortWashersByScore(washersWithScore).slice(0, limit);

    // Mark the best match (highest score)
    const result = topWashers.map((washer, index) => ({
      ...washer,
      isBestMatch: index === 0,
      rank: index + 1,
    }));

    return NextResponse.json({
      washers: result,
      total: washersWithScore.length,
      showing: result.length,
      serviceLocation: {
        latitude,
        longitude,
      },
    });
  } catch (error) {
    console.error('Error matching washers:', error);
    return NextResponse.json(
      { error: 'Failed to match washers' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings/match-washers - Get available washers count
 */
export async function GET(request: NextRequest) {
  try {
    const availableWashers = await prisma.user.count({
      where: {
        role: 'WASHER',
        isApproved: true,
        isAvailable: true,
        isActive: true,
      },
    });

    const washersWithLocation = await prisma.user.count({
      where: {
        role: 'WASHER',
        isApproved: true,
        isAvailable: true,
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    return NextResponse.json({
      availableWashers,
      washersWithLocation,
    });
  } catch (error) {
    console.error('Error getting washers count:', error);
    return NextResponse.json(
      { error: 'Failed to get washers count' },
      { status: 500 }
    );
  }
}
