'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ReviewModal from '@/components/modals/ReviewModal'
import WasherSelectionStep from '@/components/booking/WasherSelectionStep'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
}

interface Service {
  id: string
  name: string
  type: string
  description: string
  basePrice: number
  duration: number
  features: string[]
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  color: string
  plateNumber: string | null
  size: string
  isDefault: boolean
}

interface Booking {
  id: string
  status: string
  scheduledFor: string
  completedAt: string | null
  service: {
    name: string
    basePrice: number
  }
  totalAmount: number
  washer?: {
    id: string
    name: string
    rating: number
    profileImage?: string
  }
  vehicle: {
    make: string
    model: string
  }
  customerNotes: string | null
  review?: {
    id: string
    rating: number
    comment: string | null
    createdAt: string
  }
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('book')
  const [services, setServices] = useState<Service[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  // Booking form state
  const [selectedService, setSelectedService] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedWasher, setSelectedWasher] = useState<string | null>(null)
  const [washerSelectionMode, setWasherSelectionMode] = useState<'automatic' | 'manual' | 'favorites'>('automatic')
  const [addressCoordinates, setAddressCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)

  // Vehicle form state
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    plateNumber: '',
    size: 'MEDIUM',
  })

  // Review Modal state
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    booking: Booking | null
  }>({
    isOpen: false,
    booking: null,
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(storedUser))
    fetchServices()
    fetchVehicles()
    fetchBookings()
  }, [router])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/vehicles', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/bookings/customer', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService || !selectedVehicle || !selectedDate || !selectedTime || !address) {
      toast.error('Please fill all required fields')
      return
    }

    if (!addressCoordinates) {
      toast.error('Please wait for address to be validated')
      return
    }

    // Validate washer selection for manual and favorites modes
    if (washerSelectionMode !== 'automatic' && !selectedWasher) {
      toast.error('Please select a washer')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedService,
          vehicleId: selectedVehicle,
          scheduledFor: `${selectedDate}T${selectedTime}:00`,
          address,
          latitude: addressCoordinates.latitude,
          longitude: addressCoordinates.longitude,
          notes,
          washerId: selectedWasher, // null for automatic mode
          washerSelectionMode,
        }),
      })

      if (response.ok) {
        toast.success('Booking created successfully!')
        setActiveTab('bookings')
        fetchBookings()
        // Reset form
        setSelectedService('')
        setSelectedVehicle('')
        setSelectedDate('')
        setSelectedTime('')
        setAddress('')
        setNotes('')
        setSelectedWasher(null)
        setWasherSelectionMode('automatic')
        setAddressCoordinates(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to create booking')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleForm),
      })

      if (response.ok) {
        toast.success('Vehicle added successfully!')
        setShowVehicleForm(false)
        setVehicleForm({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          color: '',
          plateNumber: '',
          size: 'MEDIUM',
        })
        fetchVehicles()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add vehicle')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      ON_THE_WAY: 'bg-purple-100 text-purple-800',
      IN_PROGRESS: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    return status.replace('_', ' ')
  }

  const selectedServiceData = services.find(s => s.id === selectedService)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">CarWash Pro</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Customer</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 hidden sm:block">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h2>
          <p className="mt-1 opacity-90">Ready for your next car wash? Book now or manage your appointments</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { key: 'book', label: '🚗 Book Service', icon: '📅' },
                { key: 'bookings', label: '📋 My Bookings', icon: '📋' },
                { key: 'profile', label: '👤 My Profile', icon: '👤' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* BOOK SERVICE TAB */}
          {activeTab === 'book' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Book a Car Wash Service</h3>
              <form onSubmit={handleBooking} className="space-y-8">
                {/* Service Selection */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    1. Select Service Package
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                          selectedService === service.id
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-900">{service.name}</h4>
                          {selectedService === service.id && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </div>
                        <div className="mb-3">
                          <span className="text-3xl font-bold text-blue-600">${service.basePrice}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 min-h-[40px]">{service.description}</p>
                        <div className="space-y-1">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-start text-xs text-gray-600">
                              <span className="text-green-500 mr-1">✓</span>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">⏱️ {service.duration} minutes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedServiceData && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-2">
                        Selected: {selectedServiceData.name} - ${selectedServiceData.basePrice}
                      </p>
                      <p className="text-sm text-blue-700">All features included:</p>
                      <ul className="mt-2 grid grid-cols-2 gap-2">
                        {selectedServiceData.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-blue-700 flex items-start">
                            <span className="text-green-600 mr-1">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    2. Select Vehicle
                  </label>
                  {vehicles.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 mb-4">No vehicles registered yet</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Add a vehicle in My Profile →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          onClick={() => setSelectedVehicle(vehicle.id)}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                            selectedVehicle === vehicle.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </h4>
                              <p className="text-sm text-gray-600">{vehicle.color}</p>
                              {vehicle.plateNumber && (
                                <p className="text-sm text-gray-500">Plate: {vehicle.plateNumber}</p>
                              )}
                            </div>
                            {selectedVehicle === vehicle.id && (
                              <span className="text-blue-600">✓</span>
                            )}
                          </div>
                          {vehicle.isDefault && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date and Time */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    3. Schedule Date & Time
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select time</option>
                        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    4. Service Location
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      // Reset coordinates when address changes
                      setAddressCoordinates(null);
                    }}
                    onBlur={async () => {
                      // Geocode address when user finishes typing
                      if (address.trim()) {
                        try {
                          const response = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
                          );
                          const data = await response.json();
                          if (data && data[0]) {
                            setAddressCoordinates({
                              latitude: parseFloat(data[0].lat),
                              longitude: parseFloat(data[0].lon),
                            });
                          }
                        } catch (error) {
                          console.error('Geocoding error:', error);
                        }
                      }
                    }}
                    placeholder="Enter your full address (street, city, state, zip)"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {addressCoordinates && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Ubicación confirmada
                    </p>
                  )}
                </div>

                {/* Washer Selection - Only show if address has coordinates */}
                {addressCoordinates && (
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      5. Seleccionar Lavador
                    </label>
                    <WasherSelectionStep
                      address={addressCoordinates}
                      onWasherSelected={(washerId, mode) => {
                        setSelectedWasher(washerId);
                        setWasherSelectionMode(mode);
                      }}
                      selectedWasherId={selectedWasher}
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Any special instructions for the washer..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !selectedService || !selectedVehicle}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Booking...
                      </span>
                    ) : (
                      <>🚗 Confirm Booking</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MY BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">My Bookings</h3>
                <button
                  onClick={() => setActiveTab('book')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  + New Booking
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-lg mb-6">No bookings yet. Book your first car wash!</p>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Book Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-xl p-6 hover:shadow-lg transition">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-lg font-bold text-gray-900">{booking.service.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start text-gray-600">
                              <span className="mr-2">📅</span>
                              <div>
                                <div className="font-medium">Scheduled</div>
                                <div>{new Date(booking.scheduledFor).toLocaleDateString()} at{' '}
                                {new Date(booking.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                            </div>

                            {booking.completedAt && (
                              <div className="flex items-start text-gray-600">
                                <span className="mr-2">✅</span>
                                <div>
                                  <div className="font-medium">Completed</div>
                                  <div>{new Date(booking.completedAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-start text-gray-600">
                              <span className="mr-2">🚗</span>
                              <div>
                                <div className="font-medium">Vehicle</div>
                                <div>{booking.vehicle.make} {booking.vehicle.model}</div>
                              </div>
                            </div>

                            {booking.washer && (
                              <div className="flex items-start text-gray-600">
                                <span className="mr-2">👤</span>
                                <div>
                                  <div className="font-medium">Washer</div>
                                  <div>{booking.washer.name} ({booking.washer.rating} ⭐)</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {booking.customerNotes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 mb-1">Your Notes:</p>
                              <p className="text-sm text-gray-700">{booking.customerNotes}</p>
                            </div>
                          )}
                        </div>

                        <div className="lg:text-right space-y-2">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">${booking.totalAmount}</p>
                            <p className="text-xs text-gray-500">Total Amount</p>
                          </div>

                          {/* Show review if exists */}
                          {booking.review && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">Tu Calificación</p>
                              <div className="flex items-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-lg ${i < booking.review!.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              {booking.review.comment && (
                                <p className="text-xs text-gray-600 italic">"{booking.review.comment}"</p>
                              )}
                            </div>
                          )}

                          {/* Show rating button if completed and no review */}
                          {booking.status === 'COMPLETED' && booking.washer && !booking.review && (
                            <button
                              onClick={() => setReviewModal({ isOpen: true, booking })}
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium w-full"
                            >
                              ⭐ Calificar Servicio
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h3>

                {/* User Info */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-6">
                      <h4 className="text-2xl font-bold text-gray-900">{user?.name}</h4>
                      <p className="text-gray-600">{user?.email}</p>
                      {user?.phone && <p className="text-gray-600">{user.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* My Vehicles */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900">My Vehicles</h4>
                    <button
                      onClick={() => setShowVehicleForm(!showVehicleForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      {showVehicleForm ? 'Cancel' : '+ Add Vehicle'}
                    </button>
                  </div>

                  {showVehicleForm && (
                    <form onSubmit={handleAddVehicle} className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-4">Add New Vehicle</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                          <input
                            type="text"
                            required
                            value={vehicleForm.make}
                            onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Toyota, Honda, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                          <input
                            type="text"
                            required
                            value={vehicleForm.model}
                            onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Camry, Civic, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                          <input
                            type="number"
                            required
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            value={vehicleForm.year}
                            onChange={(e) => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                          <input
                            type="text"
                            required
                            value={vehicleForm.color}
                            onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Black, White, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
                          <input
                            type="text"
                            value={vehicleForm.plateNumber}
                            onChange={(e) => setVehicleForm({...vehicleForm, plateNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="ABC1234"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                          <select
                            value={vehicleForm.size}
                            onChange={(e) => setVehicleForm({...vehicleForm, size: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="SMALL">Small (Compact)</option>
                            <option value="MEDIUM">Medium (Sedan)</option>
                            <option value="LARGE">Large (SUV)</option>
                            <option value="EXTRA_LARGE">Extra Large (Truck)</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add Vehicle'}
                      </button>
                    </form>
                  )}

                  {vehicles.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-gray-400 text-5xl mb-3">🚗</div>
                      <p className="text-gray-500">No vehicles registered yet</p>
                      <p className="text-sm text-gray-400 mt-1">Add a vehicle to start booking services</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition">
                          <div className="flex justify-between items-start mb-3">
                            <div className="text-4xl">🚗</div>
                            {vehicle.isDefault && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-gray-900 text-lg mb-1">
                            {vehicle.year} {vehicle.make}
                          </h5>
                          <p className="text-gray-600 mb-2">{vehicle.model}</p>
                          <div className="space-y-1 text-sm text-gray-500">
                            <p>🎨 {vehicle.color}</p>
                            {vehicle.plateNumber && <p>🔢 {vehicle.plateNumber}</p>}
                            <p>📏 {vehicle.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.booking && reviewModal.booking.washer && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() => setReviewModal({ isOpen: false, booking: null })}
          booking={{
            id: reviewModal.booking.id,
            washer: {
              name: reviewModal.booking.washer.name,
              profileImage: reviewModal.booking.washer.profileImage,
            },
            service: {
              name: reviewModal.booking.service.name,
            },
          }}
          customerId={user?.id || ''}
          onReviewSubmitted={() => {
            fetchBookings()
          }}
        />
      )}
    </div>
  )
}
