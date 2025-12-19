'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaCar, FaMapMarkerAlt, FaClock, FaStar, FaShieldAlt, FaMoneyBillWave } from 'react-icons/fa'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const services = [
    {
      name: 'Basic Wash',
      price: '$30',
      duration: '30 min',
      features: ['Exterior wash', 'Tire shine', 'Window cleaning', 'Quick dry'],
    },
    {
      name: 'Standard Wash',
      price: '$50',
      duration: '45 min',
      features: ['Everything in Basic', 'Interior vacuum', 'Dashboard wipe', 'Air freshener'],
      popular: true,
    },
    {
      name: 'Premium Detail',
      price: '$80',
      duration: '60 min',
      features: ['Everything in Standard', 'Leather conditioning', 'Deep clean', 'Wax protection'],
    },
    {
      name: 'Full Detailing',
      price: '$120',
      duration: '90 min',
      features: ['Complete interior detail', 'Paint protection', 'Engine bay cleaning', 'Full restoration'],
    },
  ]

  const benefits = [
    {
      icon: <FaMapMarkerAlt className="text-4xl text-blue-500" />,
      title: 'At Your Location',
      description: 'We come to your home, office, or any location convenient for you',
    },
    {
      icon: <FaClock className="text-4xl text-blue-500" />,
      title: 'Save Time',
      description: 'Book in seconds, get your car washed while you work or relax',
    },
    {
      icon: <FaStar className="text-4xl text-blue-500" />,
      title: 'Professional Service',
      description: 'Verified and rated washers with all equipment included',
    },
    {
      icon: <FaShieldAlt className="text-4xl text-blue-500" />,
      title: 'Insured & Safe',
      description: 'All services are insured, secure payments, satisfaction guaranteed',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FaCar className="text-blue-600 text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900">CarWash Pro</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600">Services</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Book Now
              </Link>
              <Link href="/washer/register" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
                Become a Washer
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#services" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Services</a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:text-blue-600">How It Works</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Pricing</a>
              <Link href="/login" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Login</Link>
              <Link href="/register" className="block px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Book Now
              </Link>
              <Link href="/washer/register" className="block px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                Become a Washer
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
            alt="Black Porsche 911"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full">
                ⭐ Premium Mobile Car Wash Service
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your Car Deserves
              <span className="text-blue-400"> The Best Care</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed">
              Professional detailing at your doorstep. We bring showroom shine to wherever you are.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="group bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center"
              >
                <span>Book Your Wash</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/washer/register"
                className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all shadow-xl flex items-center justify-center"
              >
                <FaMoneyBillWave className="mr-2" />
                <span>Earn as a Washer</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
              <div>
                <div className="text-3xl font-bold text-white">2,500+</div>
                <div className="text-sm text-gray-300">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">4.9⭐</div>
                <div className="text-sm text-gray-300">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-300">Available Service</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose CarWash Pro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services/Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-lg p-6 relative ${
                  service.popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {service.popular && (
                  <span className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm rounded-bl-lg rounded-tr-lg">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-blue-600">{service.price}</span>
                  <span className="text-gray-500 ml-2">/ {service.duration}</span>
                </div>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-6 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Service</h3>
              <p className="text-gray-600">Choose your service package and schedule a time that works for you</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Washer Arrives</h3>
              <p className="text-gray-600">A professional washer comes to your location with all equipment</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Clean Car</h3>
              <p className="text-gray-600">Pay securely through the app and rate your experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who save time with our mobile car wash service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
              Book Your First Wash
            </Link>
            <Link href="/washer/register" className="bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-800 transition">
              Start Earning Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FaCar className="text-blue-400 text-2xl mr-2" />
                <span className="text-xl font-bold">CarWash Pro</span>
              </div>
              <p className="text-gray-400">Professional mobile car wash service at your location</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Basic Wash</a></li>
                <li><a href="#" className="hover:text-white">Standard Wash</a></li>
                <li><a href="#" className="hover:text-white">Premium Detail</a></li>
                <li><a href="#" className="hover:text-white">Full Detailing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Become a Washer</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CarWash Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
