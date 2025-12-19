import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWasherDeactivatedEmail } from '@/lib/email';

/**
 * PATCH /api/admin/washers/[id] - Update washer status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive, reason } = await request.json();
    const washerId = params.id;

    const washer = await prisma.user.findUnique({
      where: { id: washerId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!washer || washer.role !== 'WASHER') {
      return NextResponse.json(
        { error: 'Washer not found' },
        { status: 404 }
      );
    }

    // Update status
    const updatedWasher = await prisma.user.update({
      where: { id: washerId },
      data: { isActive },
    });

    // Send email notification
    try {
      if (!isActive && reason) {
        await sendWasherDeactivatedEmail(washer.email, washer.name, reason);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    return NextResponse.json({
      success: true,
      washer: updatedWasher,
    });
  } catch (error) {
    console.error('Error updating washer:', error);
    return NextResponse.json(
      { error: 'Failed to update washer' },
      { status: 500 }
    );
  }
}
