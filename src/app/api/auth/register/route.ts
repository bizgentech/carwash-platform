import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { createStripeCustomer } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, role } = await req.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone: phone || undefined }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email or phone' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create Stripe customer for customers
    let stripeCustomerId = null
    if (role === 'CUSTOMER') {
      try {
        const stripeCustomer = await createStripeCustomer(email, '')
        stripeCustomerId = stripeCustomer.id
      } catch (error) {
        console.error('Error creating Stripe customer:', error)
        // Continue without Stripe customer
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        // Add Stripe customer ID if available
        ...(stripeCustomerId && { stripeCustomerId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    })

    // Generate token
    const token = generateToken(user)

    return NextResponse.json({
      message: 'User created successfully',
      user,
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
