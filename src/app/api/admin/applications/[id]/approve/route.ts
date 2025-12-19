import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendWasherApprovedEmail } from '@/lib/email';

/**
 * POST /api/admin/applications/[id]/approve - Approve washer application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;

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

    // Generate temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(temporaryPassword);

    // Create washer user account
    const washer = await prisma.user.create({
      data: {
        email: application.email,
        phone: application.phone,
        name: application.fullName,
        password: hashedPassword,
        role: 'WASHER',
        isActive: true,
        isApproved: true,
        isAvailable: true,
      },
    });

    // Update application status
    await prisma.washerApplication.update({
      where: { id: applicationId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
    });

    // Send approval email with credentials
    try {
      await sendWasherApprovedEmail(
        application.email,
        application.fullName,
        temporaryPassword
      );
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
    }

    return NextResponse.json({
      success: true,
      washer,
      message: 'Application approved and user created',
    });
  } catch (error) {
    console.error('Error approving application:', error);
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    );
  }
}
