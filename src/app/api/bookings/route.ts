import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { calculateDistance, calculateMatchScore } from '@/lib/haversine';

/**
 * POST /api/bookings
 * Create a new booking
 * Handles automatic washer assignment if washerSelectionMode is 'automatic'
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

    const {
      serviceId,
      vehicleId,
      scheduledFor,
      address,
      latitude,
      longitude,
      notes,
      washerId,
      washerSelectionMode = 'automatic',
    } = await request.json();

    // Validate required fields
    if (!serviceId || !vehicleId || !scheduledFor || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that customer owns the vehicle
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: customerId,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Validate service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Get or create address
    let addressRecord = await prisma.address.findFirst({
      where: {
        userId: customerId,
        street: address,
      },
    });

    if (!addressRecord) {
      addressRecord = await prisma.address.create({
        data: {
          userId: customerId,
          label: 'Service Location',
          street: address,
          city: '', // Could be parsed from address
          state: '',
          zipCode: '',
          latitude: latitude || 0,
          longitude: longitude || 0,
          isDefault: false,
        },
      });
    }

    // Determine final washer ID
    let finalWasherId = washerId;

    // If automatic mode, find best washer
    if (washerSelectionMode === 'automatic') {
      if (!latitude || !longitude) {
        return NextResponse.json(
          { error: 'Latitude and longitude required for automatic assignment' },
          { status: 400 }
        );
      }

      // Get available washers
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
          rating: true,
          latitude: true,
          longitude: true,
          serviceRadius: true,
        },
      });

      if (washers.length === 0) {
        return NextResponse.json(
          { error: 'No washers available at the moment' },
          { status: 404 }
        );
      }

      // Calculate scores and find best match
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
            score,
          };
        })
        .filter((w) => w !== null);

      if (washersWithScore.length === 0) {
        return NextResponse.json(
          { error: 'No washers available in your area' },
          { status: 404 }
        );
      }

      // Get washer with highest score
      const bestWasher = washersWithScore.sort((a, b) => b!.score - a!.score)[0];
      finalWasherId = bestWasher!.id;
    }

    // Validate washer if provided or assigned
    if (finalWasherId) {
      const washer = await prisma.user.findFirst({
        where: {
          id: finalWasherId,
          role: 'WASHER',
          isApproved: true,
          isActive: true,
        },
      });

      if (!washer) {
        return NextResponse.json(
          { error: 'Selected washer is not available' },
          { status: 404 }
        );
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId,
        washerId: finalWasherId || undefined,
        vehicleId,
        serviceId,
        addressId: addressRecord.id,
        scheduledFor: new Date(scheduledFor),
        status: finalWasherId ? 'PENDING' : 'PENDING', // Could be UNASSIGNED if no washer
        price: service.basePrice,
        totalAmount: service.basePrice,
        customerNotes: notes || '',
      },
      include: {
        service: {
          select: {
            name: true,
            basePrice: true,
          },
        },
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
          },
        },
        washer: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
          },
        },
      },
    });

    // Create notification for washer if assigned
    if (finalWasherId) {
      await prisma.notification.create({
        data: {
          userId: finalWasherId,
          bookingId: booking.id,
          title: 'Nueva Reserva Asignada',
          message: `Tienes una nueva reserva para ${booking.service.name}`,
          type: 'BOOKING',
        },
      });
    }

    return NextResponse.json({
      booking,
      washerAssignmentMode: washerSelectionMode,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings
 * Get all bookings (admin or washer specific)
 */
export async function GET(request: NextRequest) {
  try {
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

    const userId = decoded.userId;

    // Get user to determine role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Query based on role
    let bookings;
    if (user.role === 'ADMIN') {
      // Admin sees all bookings
      bookings = await prisma.booking.findMany({
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          washer: {
            select: {
              id: true,
              name: true,
              email: true,
              rating: true,
            },
          },
          service: {
            select: {
              name: true,
              basePrice: true,
            },
          },
          vehicle: {
            select: {
              make: true,
              model: true,
              year: true,
            },
          },
        },
        orderBy: {
          scheduledFor: 'desc',
        },
      });
    } else if (user.role === 'WASHER') {
      // Washer sees their assigned bookings
      bookings = await prisma.booking.findMany({
        where: {
          washerId: userId,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            select: {
              name: true,
              basePrice: true,
            },
          },
          vehicle: {
            select: {
              make: true,
              model: true,
              year: true,
              color: true,
              plateNumber: true,
            },
          },
          address: true,
        },
        orderBy: {
          scheduledFor: 'desc',
        },
      });
    } else {
      // Customer sees their bookings (use /api/bookings/customer instead)
      return NextResponse.json(
        { error: 'Use /api/bookings/customer for customer bookings' },
        { status: 400 }
      );
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
