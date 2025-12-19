import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sendWasherApplicationNotification,
  sendWasherApplicationConfirmation,
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      // Personal Information
      fullName,
      email,
      phone,
      street,
      city,
      state,
      zipCode,

      // Business Information
      businessName,
      serviceType,
      yearsExperience,
      description,

      // Documents
      idDocument,
      insuranceProof,
      vehiclePhoto,
      businessLogo,
      certificates,

      // Payment Information
      paymentType,
      bankName,
      accountHolderName,
      routingNumber,
      accountNumber,
      paypalEmail,
      stripeEmail,
      otherPaymentDetails,

      // References
      reference1Name,
      reference1Phone,
      reference1Email,
      reference2Name,
      reference2Phone,
      reference2Email,

      // Terms
      termsAccepted,
    } = body;

    // Validation
    if (!fullName || !email || !phone || !street || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios de información personal' },
        { status: 400 }
      );
    }

    if (!serviceType || yearsExperience === undefined || !description) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios de información del negocio' },
        { status: 400 }
      );
    }

    if (!idDocument || !insuranceProof) {
      return NextResponse.json(
        { error: 'Debes subir tu identificación oficial y prueba de seguro' },
        { status: 400 }
      );
    }

    if (!vehiclePhoto && !businessLogo) {
      return NextResponse.json(
        { error: 'Debes subir la foto de tu vehículo O el logo de tu negocio' },
        { status: 400 }
      );
    }

    if (!paymentType) {
      return NextResponse.json(
        { error: 'Debes seleccionar un tipo de cuenta de pago' },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'Debes aceptar los términos y condiciones' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingApplication = await prisma.washerApplication.findFirst({
      where: { email },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Ya existe una solicitud con este email' },
        { status: 400 }
      );
    }

    // Create washer application
    const application = await prisma.washerApplication.create({
      data: {
        // Personal Information
        fullName,
        email,
        phone,
        street,
        city,
        state,
        zipCode,

        // Business Information
        businessName: businessName || null,
        serviceType,
        yearsExperience,
        description,

        // Documents
        idDocument,
        insuranceProof,
        vehiclePhoto: vehiclePhoto || null,
        businessLogo: businessLogo || null,
        certificates: certificates || [],

        // Payment Information
        paymentType,
        bankName: bankName || null,
        accountHolderName: accountHolderName || null,
        routingNumber: routingNumber || null,
        accountNumber: accountNumber || null,
        paypalEmail: paypalEmail || null,
        stripeEmail: stripeEmail || null,
        otherPaymentDetails: otherPaymentDetails || null,

        // References
        reference1Name: reference1Name || null,
        reference1Phone: reference1Phone || null,
        reference1Email: reference1Email || null,
        reference2Name: reference2Name || null,
        reference2Phone: reference2Phone || null,
        reference2Email: reference2Email || null,

        // Terms
        termsAccepted,
        termsAcceptedAt: new Date(),

        // Status
        status: 'PENDING',
      },
    });

    // Send notification emails
    try {
      // Send confirmation email to applicant
      await sendWasherApplicationConfirmation(email, fullName);

      // Send notification to admin
      await sendWasherApplicationNotification({
        fullName,
        email,
        phone,
        businessName: businessName || undefined,
        serviceType,
        yearsExperience,
        applicationId: application.id,
      });
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Solicitud enviada correctamente',
    });
  } catch (error) {
    console.error('Error creating washer application:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
