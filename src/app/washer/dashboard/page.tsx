'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
  rating: number
  totalJobs: number
  isAvailable: boolean
}

interface Booking {
  id: string
  status: string
  scheduledFor: string
  service: {
    name: string
    duration: number
  }
  customer: {
    name: string
    email: string
  }
  vehicle: {
    make: string
    model: string
    color: string
  }
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  totalAmount: number
  customerNotes: string | null
}

export default function WasherDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('available')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    setIsAvailable(userData.isAvailable || false)
    fetchBookings()
  }, [router])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/bookings/washer', {
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

  const toggleAvailability = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/washer/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      })

      if (response.ok) {
        setIsAvailable(!isAvailable)
        toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'}`)
      }
    } catch (error) {
      toast.error('Failed to update availability')
    } finally {
      setLoading(false)
    }
  }

  const acceptBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        toast.success('Booking accepted!')
        fetchBookings()
      } else {
        toast.error('Failed to accept booking')
      }
    } catch (error) {
      toast.error('Something went wrong')
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

  const availableBookings = bookings.filter(b => b.status === 'PENDING')
  const myBookings = bookings.filter(b => ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(b.status))
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">CarWash Pro</h1>
              <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Washer</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user?.name}</span>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-sm mb-1">Rating</p>
            <p className="text-3xl font-bold text-gray-900">{user?.rating || 0} ⭐</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-sm mb-1">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-900">{user?.totalJobs || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-sm mb-1">Available Jobs</p>
            <p className="text-3xl font-bold text-gray-900">{availableBookings.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-500 text-sm mb-2">Status</p>
            <button
              onClick={toggleAvailability}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                isAvailable
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {isAvailable ? '🟢 Available' : '⚫ Offline'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { key: 'available', label: `Available Jobs (${availableBookings.length})` },
                { key: 'my-jobs', label: `My Jobs (${myBookings.length})` },
                { key: 'history', label: `History (${completedBookings.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
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
          {activeTab === 'available' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Available Jobs</h3>
              {availableBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">🚗</div>
                  <p className="text-gray-500">No available jobs at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-5 hover:shadow-md transition">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">{booking.service.name}</h4>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              ${booking.totalAmount}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>📅 {new Date(booking.scheduledFor).toLocaleDateString()} at{' '}
                              {new Date(booking.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p>👤 Customer: {booking.customer.name}</p>
                            <p>🚗 {booking.vehicle.color} {booking.vehicle.make} {booking.vehicle.model}</p>
                            <p>📍 {booking.address.street}, {booking.address.city}, {booking.address.state}</p>
                            {booking.customerNotes && (
                              <p className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-gray-700">
                                💬 Note: {booking.customerNotes}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => acceptBooking(booking.id)}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                        >
                          Accept Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-jobs' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">My Active Jobs</h3>
              {myBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">📋</div>
                  <p className="text-gray-500">No active jobs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-gray-900">{booking.service.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">${booking.totalAmount}</p>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📅 {new Date(booking.scheduledFor).toLocaleDateString()} at{' '}
                          {new Date(booking.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p>👤 {booking.customer.name}</p>
                        <p>🚗 {booking.vehicle.color} {booking.vehicle.make} {booking.vehicle.model}</p>
                        <p>📍 {booking.address.street}, {booking.address.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Completed Jobs</h3>
              {completedBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">✅</div>
                  <p className="text-gray-500">No completed jobs yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-5 bg-green-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">{booking.service.name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.scheduledFor).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.vehicle.make} {booking.vehicle.model}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            COMPLETED
                          </span>
                          <p className="mt-2 text-xl font-bold text-green-600">${booking.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
