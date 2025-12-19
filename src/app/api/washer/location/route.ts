import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/washer/location - Update washer's current location
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { washerId, latitude, longitude, isAvailable } = body;

    if (!washerId) {
      return NextResponse.json(
        { error: 'Washer ID is required' },
        { status: 400 }
      );
    }

    // Verify washer exists
    const washer = await prisma.user.findUnique({
      where: { id: washerId, role: 'WASHER' },
    });

    if (!washer) {
      return NextResponse.json(
        { error: 'Washer not found' },
        { status: 404 }
      );
    }

    if (!washer.isApproved) {
      return NextResponse.json(
        { error: 'Washer is not approved yet' },
        { status: 403 }
      );
    }

    // Validate coordinates if provided
    if (latitude !== undefined || longitude !== undefined) {
      if (latitude === undefined || longitude === undefined) {
        return NextResponse.json(
          { error: 'Both latitude and longitude are required' },
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
    }

    // Update data
    const updateData: any = {
      lastLocationUpdate: new Date(),
    };

    if (latitude !== undefined && longitude !== undefined) {
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    }

    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
    }

    const updatedWasher = await prisma.user.update({
      where: { id: washerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        lastLocationUpdate: true,
        isAvailable: true,
        serviceRadius: true,
      },
    });

    return NextResponse.json(updatedWasher);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/washer/location - Get washer's current location
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const washerId = searchParams.get('washerId');

    if (!washerId) {
      return NextResponse.json(
        { error: 'Washer ID is required' },
        { status: 400 }
      );
    }

    const washer = await prisma.user.findUnique({
      where: { id: washerId, role: 'WASHER' },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        lastLocationUpdate: true,
        isAvailable: true,
        serviceRadius: true,
      },
    });

    if (!washer) {
      return NextResponse.json(
        { error: 'Washer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(washer);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}
