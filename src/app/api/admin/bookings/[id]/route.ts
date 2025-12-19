import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/bookings/[id] - Get detailed booking information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        washer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            rating: true,
            totalJobs: true,
          },
        },
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
            color: true,
            plateNumber: true,
            size: true,
          },
        },
        service: {
          select: {
            name: true,
            type: true,
            description: true,
            features: true,
            duration: true,
          },
        },
        address: true,
        payment: true,
        review: {
          include: {
            reviewer: { select: { name: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Build timeline
    const timeline = [
      {
        status: 'PENDING',
        label: 'Solicitud Creada',
        timestamp: booking.createdAt,
        completed: true,
      },
      {
        status: 'ACCEPTED',
        label: 'Aceptada por Lavador',
        timestamp: booking.status !== 'PENDING' ? booking.updatedAt : null,
        completed: ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status),
      },
      {
        status: 'ON_THE_WAY',
        label: 'Lavador en Camino',
        timestamp: booking.status === 'ON_THE_WAY' || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED' ? booking.updatedAt : null,
        completed: ['ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status),
      },
      {
        status: 'IN_PROGRESS',
        label: 'Servicio en Progreso',
        timestamp: booking.startedAt,
        completed: ['IN_PROGRESS', 'COMPLETED'].includes(booking.status),
      },
      {
        status: 'COMPLETED',
        label: 'Servicio Completado',
        timestamp: booking.completedAt,
        completed: booking.status === 'COMPLETED',
      },
    ];

    // Calculate service fee breakdown
    const serviceFee = booking.payment ? {
      subtotal: booking.price,
      tip: booking.tip,
      total: booking.totalAmount,
      platformFee: booking.payment.platformFee,
      washerAmount: booking.payment.washerAmount,
    } : null;

    return NextResponse.json({
      booking: {
        id: booking.id,
        status: booking.status,
        scheduledFor: booking.scheduledFor,
        startedAt: booking.startedAt,
        completedAt: booking.completedAt,
        customerNotes: booking.customerNotes,
        washerNotes: booking.washerNotes,
        beforePhoto: booking.beforePhoto,
        afterPhoto: booking.afterPhoto,
        photosApproved: booking.photosApproved,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
      customer: booking.customer,
      washer: booking.washer,
      vehicle: booking.vehicle,
      service: booking.service,
      address: booking.address,
      payment: booking.payment,
      review: booking.review,
      timeline,
      serviceFee,
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}
