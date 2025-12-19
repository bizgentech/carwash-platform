import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDistance, calculateMatchScore } from '@/lib/haversine';

/**
 * POST /api/bookings/washer-preview
 * Get a preview of the washer that would be automatically assigned
 * Returns the top 1 matched washer based on rating and proximity
 */
export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Get available washers with location
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
        rating: true,
        totalReviews: true,
        totalJobs: true,
        latitude: true,
        longitude: true,
        serviceRadius: true,
        profileImage: true,
        phone: true,
      },
    });

    if (washers.length === 0) {
      return NextResponse.json(
        { error: 'No washers available at the moment' },
        { status: 404 }
      );
    }

    // Calculate distance and score for each washer
    const washersWithScore = washers
      .map((washer) => {
        const distanceKm = calculateDistance(
          { latitude, longitude },
          { latitude: washer.latitude!, longitude: washer.longitude! }
        );

        // Skip if outside service radius
        if (distanceKm > washer.serviceRadius) {
          return null;
        }

        const score = calculateMatchScore(washer.rating, distanceKm);

        return {
          id: washer.id,
          name: washer.name,
          email: washer.email,
          rating: washer.rating,
          totalReviews: washer.totalReviews,
          totalJobs: washer.totalJobs,
          profileImage: washer.profileImage,
          phone: washer.phone,
          distanceKm: Math.round(distanceKm * 10) / 10,
          score: Math.round(score * 100) / 100,
        };
      })
      .filter((w) => w !== null);

    if (washersWithScore.length === 0) {
      return NextResponse.json(
        { error: 'No washers available in your area' },
        { status: 404 }
      );
    }

    // Sort by score (highest first) and get top 1
    const topWasher = washersWithScore.sort((a, b) => b!.score - a!.score)[0];

    return NextResponse.json({
      washer: topWasher,
    });
  } catch (error) {
    console.error('Error getting washer preview:', error);
    return NextResponse.json(
      { error: 'Failed to get washer preview' },
      { status: 500 }
    );
  }
}
