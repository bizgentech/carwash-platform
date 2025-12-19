import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const PLATFORM_FEE_PERCENTAGE = parseInt(process.env.PLATFORM_FEE_PERCENTAGE || '20')

export interface CreateConnectAccountParams {
  email: string
  userId: string
}

export interface ProcessPaymentParams {
  amount: number
  customerId: string
  washerId: string
  bookingId: string
  tip?: number
}

// Create Stripe Connect account for washers
export const createConnectAccount = async ({ email, userId }: CreateConnectAccountParams) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        userId,
      },
    })

    return account
  } catch (error) {
    console.error('Error creating Connect account:', error)
    throw error
  }
}

// Create account link for onboarding
export const createAccountLink = async (accountId: string, userId: string) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/washer/onboarding?userId=${userId}`,
      return_url: `${process.env.NEXTAUTH_URL}/washer/dashboard?onboarded=true`,
      type: 'account_onboarding',
    })

    return accountLink
  } catch (error) {
    console.error('Error creating account link:', error)
    throw error
  }
}

// Process payment and split between platform and washer
export const processPayment = async ({
  amount,
  customerId,
  washerId,
  bookingId,
  tip = 0,
}: ProcessPaymentParams) => {
  try {
    // Calculate fees
    const totalAmount = amount + tip
    const platformFee = Math.floor(amount * (PLATFORM_FEE_PERCENTAGE / 100))
    const washerAmount = totalAmount - platformFee

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId,
        customerId,
        washerId,
        platformFee: platformFee.toString(),
        tip: tip.toString(),
      },
      // Automatically transfer to washer's Connect account
      transfer_data: {
        destination: washerId, // This should be the Stripe Connect account ID
        amount: Math.round(washerAmount * 100),
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Error processing payment:', error)
    throw error
  }
}

// Create customer in Stripe
export const createStripeCustomer = async (email: string, userId: string) => {
  try {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

// Get washer's balance
export const getWasherBalance = async (stripeAccountId: string) => {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeAccountId,
    })

    return balance
  } catch (error) {
    console.error('Error getting balance:', error)
    throw error
  }
}

// Create payout for washer
export const createPayout = async (stripeAccountId: string, amount?: number) => {
  try {
    const payoutData: any = {
      currency: 'usd',
    }

    if (amount) {
      payoutData.amount = Math.round(amount * 100)
    }

    const payout = await stripe.payouts.create(payoutData, {
      stripeAccount: stripeAccountId,
    })

    return payout
  } catch (error) {
    console.error('Error creating payout:', error)
    throw error
  }
}

// Handle refunds
export const refundPayment = async (paymentIntentId: string, amount?: number) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
    })

    return refund
  } catch (error) {
    console.error('Error processing refund:', error)
    throw error
  }
}

export default stripe
