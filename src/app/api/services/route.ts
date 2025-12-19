import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const services = [
      {
        id: 'basic-wash',
        name: 'Basic Wash',
        type: 'BASIC',
        description: 'Quick and efficient exterior wash',
        basePrice: 30,
        duration: 30,
        features: [
          'Exterior hand wash',
          'Wheel cleaning',
          'Tire shine',
          'Windows cleaned',
        ],
      },
      {
        id: 'standard-wash',
        name: 'Standard Wash',
        type: 'STANDARD',
        description: 'Complete interior and exterior clean',
        basePrice: 50,
        duration: 45,
        features: [
          'Everything in Basic',
          'Interior vacuum',
          'Dashboard cleaning',
          'Door jambs cleaned',
          'Air freshener',
        ],
      },
      {
        id: 'premium-detail',
        name: 'Premium Detail',
        type: 'PREMIUM',
        description: 'Deep clean with protection',
        basePrice: 80,
        duration: 60,
        features: [
          'Everything in Standard',
          'Clay bar treatment',
          'Wax application',
          'Upholstery cleaning',
          'Leather conditioning',
          'Engine bay cleaning',
        ],
      },
      {
        id: 'full-detailing',
        name: 'Full Detailing',
        type: 'FULL_DETAIL',
        description: 'Complete professional detailing',
        basePrice: 120,
        duration: 90,
        features: [
          'Everything in Premium',
          'Paint correction',
          'Ceramic coating',
          'Headlight restoration',
          'Pet hair removal',
          'Odor elimination',
          'Trunk cleaning',
          'Full interior protection',
        ],
      },
    ]

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}
