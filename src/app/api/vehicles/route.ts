import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/vehicles
 * Create a new vehicle for the authenticated user
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

    const userId = decoded.userId;

    const {
      make,
      model,
      year,
      color,
      plateNumber,
      size,
      isDefault,
    } = await request.json();

    // Validate required fields
    if (!make || !model || !year || !color || !size) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    // Validate size (accept both XL and EXTRA_LARGE for compatibility)
    const validSizes = ['SMALL', 'MEDIUM', 'LARGE', 'XL', 'EXTRA_LARGE'];
    if (!validSizes.includes(size)) {
      return NextResponse.json(
        { error: 'Invalid size. Must be SMALL, MEDIUM, LARGE, XL, or EXTRA_LARGE' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.vehicle.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Check if user has any vehicles - if not, make this one default
    const existingVehicles = await prisma.vehicle.count({
      where: { userId },
    });

    const shouldBeDefault = isDefault || existingVehicles === 0;

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        make,
        model,
        year,
        color,
        plateNumber: plateNumber || null,
        size,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vehicles
 * Get all vehicles for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    const userId = decoded.userId;

    // Get all vehicles for the user
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/vehicles
 * Update a vehicle
 */
export async function PATCH(request: NextRequest) {
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

    const userId = decoded.userId;

    const {
      id,
      make,
      model,
      year,
      color,
      plateNumber,
      size,
      isDefault,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to you' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault && !vehicle.isDefault) {
      await prisma.vehicle.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        make: make !== undefined ? make : vehicle.make,
        model: model !== undefined ? model : vehicle.model,
        year: year !== undefined ? year : vehicle.year,
        color: color !== undefined ? color : vehicle.color,
        plateNumber: plateNumber !== undefined ? plateNumber : vehicle.plateNumber,
        size: size !== undefined ? size : vehicle.size,
        isDefault: isDefault !== undefined ? isDefault : vehicle.isDefault,
      },
    });

    return NextResponse.json({ vehicle: updatedVehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vehicles
 * Delete a vehicle
 */
export async function DELETE(request: NextRequest) {
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

    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('id');

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Check if vehicle is used in any bookings
    const bookingsCount = await prisma.booking.count({
      where: { vehicleId },
    });

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vehicle with existing bookings' },
        { status: 400 }
      );
    }

    // Delete vehicle
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    // If this was the default vehicle, set another one as default
    if (vehicle.isDefault) {
      const firstVehicle = await prisma.vehicle.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (firstVehicle) {
        await prisma.vehicle.update({
          where: { id: firstVehicle.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
