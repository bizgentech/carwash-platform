import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/reviews - Create a review for a completed booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, reviewerId, rating, comment } = body;

    // Validate input
    if (!bookingId || !reviewerId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true,
        washer: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    if (booking.review) {
      return NextResponse.json(
        { error: 'This booking has already been reviewed' },
        { status: 400 }
      );
    }

    // Check if reviewer is the customer
    if (booking.customerId !== reviewerId) {
      return NextResponse.json(
        { error: 'Only the customer can review this booking' },
        { status: 403 }
      );
    }

    if (!booking.washerId) {
      return NextResponse.json(
        { error: 'This booking does not have a washer assigned' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId,
        reviewedId: booking.washerId,
        rating,
        comment: comment || null,
      },
    });

    // Update washer's rating
    await updateWasherRating(booking.washerId);

    // Create notification for washer
    await prisma.notification.create({
      data: {
        userId: booking.washerId,
        bookingId,
        title: 'Nueva Reseña Recibida',
        message: `Recibiste una calificación de ${rating} estrellas`,
        type: 'REVIEW',
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

/**
 * Update washer's average rating and total reviews
 */
async function updateWasherRating(washerId: string) {
  // Get all reviews for this washer
  const reviews = await prisma.review.findMany({
    where: { reviewedId: washerId },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  // Update washer's rating and totalReviews
  await prisma.user.update({
    where: { id: washerId },
    data: {
      rating: averageRating,
      totalReviews,
    },
  });
}
