import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWasherRejectedEmail } from '@/lib/email';

/**
 * POST /api/admin/applications/[id]/reject - Reject washer application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await request.json();
    const applicationId = params.id;

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Get application
    const application = await prisma.washerApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Application already processed' },
        { status: 400 }
      );
    }

    // Update application status
    await prisma.washerApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // Send rejection email
    try {
      await sendWasherRejectedEmail(
        application.email,
        application.fullName,
        reason
      );
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Application rejected',
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    );
  }
}
