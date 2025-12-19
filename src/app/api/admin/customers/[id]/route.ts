import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCustomerDeactivatedEmail, sendCustomerDeletedEmail } from '@/lib/email';

/**
 * PATCH /api/admin/customers/[id] - Update customer status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive, reason } = await request.json();
    const customerId = params.id;

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!customer || customer.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update status
    const updatedCustomer = await prisma.user.update({
      where: { id: customerId },
      data: { isActive },
    });

    // Send email notification
    try {
      if (!isActive && reason) {
        await sendCustomerDeactivatedEmail(customer.email, customer.name, reason);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id] - Delete customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'No reason provided';
    const customerId = params.id;

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!customer || customer.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Send email before deletion
    try {
      await sendCustomerDeletedEmail(customer.email, customer.name, reason);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    // Delete customer (cascade will handle related records based on schema)
    await prisma.user.delete({
      where: { id: customerId },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
