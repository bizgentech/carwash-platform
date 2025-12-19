'use client';

import { useEffect, useState } from 'react';
import { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiDollarSign, FiCalendar, FiTruck, FiEdit, FiTrash2, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onEdit?: (customerId: string) => void;
  onDeactivate?: (customerId: string) => void;
  onDelete?: (customerId: string) => void;
}

export default function CustomerDetailModal({
  isOpen,
  onClose,
  customerId,
  onEdit,
  onDeactivate,
  onDelete,
}: CustomerDetailModalProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'bookings' | 'payments'>('vehicles');

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails();
    }
  }, [isOpen, customerId]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/details`);
      if (!response.ok) throw new Error('Failed to fetch customer details');
      const data = await response.json();
      setCustomer(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Detalle del Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : customer ? (
            <div className="space-y-6">
              {/* Personal Information & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Info Card */}
                <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiUser className="mr-2" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Nombre Completo</label>
                      <p className="font-medium text-gray-900">{customer.customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium text-gray-900 flex items-center">
                        <FiMail className="mr-2 text-gray-400" />
                        {customer.customer.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Teléfono</label>
                      <p className="font-medium text-gray-900 flex items-center">
                        <FiPhone className="mr-2 text-gray-400" />
                        {customer.customer.phone || 'No registrado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Dirección Principal</label>
                      <p className="font-medium text-gray-900 flex items-center">
                        <FiMapPin className="mr-2 text-gray-400" />
                        {customer.customer.address || 'No registrada'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Estado</label>
                      <p className="font-medium">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.customer.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Miembro desde</label>
                      <p className="font-medium text-gray-900">
                        {format(new Date(customer.customer.createdAt), 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Total de Reservas</p>
                        <p className="text-2xl font-bold text-blue-900 flex items-center">
                          <FiCalendar className="mr-1" />
                          {customer.stats.totalBookings}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Reservas Completadas</p>
                        <p className="text-2xl font-bold text-green-900">
                          {customer.stats.completedBookings}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Total Gastado</p>
                        <p className="text-2xl font-bold text-purple-900 flex items-center">
                          <FiDollarSign className="mr-1" />
                          ${customer.stats.totalSpent.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600">Vehículos</p>
                        <p className="text-2xl font-bold text-orange-900 flex items-center">
                          <FiTruck className="mr-1" />
                          {customer.vehicles.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spending Chart */}
              {customer.bookingsByMonth && customer.bookingsByMonth.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Gasto Mensual
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={customer.bookingsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#10B981" name="Gasto ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Addresses */}
              {customer.addresses && customer.addresses.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiMapPin className="mr-2" />
                    Direcciones Guardadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.addresses.map((address: any) => (
                      <div key={address.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="font-medium text-gray-900">{address.street}</p>
                        <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                        {address.apartment && (
                          <p className="text-sm text-gray-600">Apt/Suite: {address.apartment}</p>
                        )}
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Predeterminada
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('vehicles')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'vehicles'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Vehículos ({customer.vehicles.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'bookings'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Historial de Reservas ({customer.bookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'payments'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Pagos ({customer.payments.length})
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'vehicles' && (
                    <div className="space-y-4">
                      {customer.vehicles.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay vehículos registrados</p>
                      ) : (
                        customer.vehicles.map((vehicle: any) => (
                          <div key={vehicle.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </p>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                  <div>Color: {vehicle.color}</div>
                                  <div>Placa: {vehicle.plateNumber}</div>
                                  <div>Tamaño: {vehicle.size}</div>
                                  {vehicle.vin && <div>VIN: {vehicle.vin}</div>}
                                </div>
                              </div>
                              {vehicle.isDefault && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Predeterminado
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'bookings' && (
                    <div className="space-y-4">
                      {customer.bookings.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay reservas registradas</p>
                      ) : (
                        customer.bookings.map((booking: any) => (
                          <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{booking.service.name}</p>
                                <p className="text-sm text-gray-600">
                                  {booking.washer ? booking.washer.name : 'Sin asignar'}
                                </p>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>Fecha: {format(new Date(booking.scheduledFor), 'dd MMM yyyy HH:mm', { locale: es })}</div>
                              <div>Total: ${booking.totalAmount.toFixed(2)}</div>
                              {booking.vehicle && (
                                <div className="col-span-2">
                                  Vehículo: {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'payments' && (
                    <div className="space-y-4">
                      {customer.payments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay pagos registrados</p>
                      ) : (
                        customer.payments.map((payment: any) => (
                          <div key={payment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900 flex items-center">
                                  <FiCreditCard className="mr-2 text-gray-400" />
                                  ${payment.amount.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {payment.booking?.service?.name || 'Servicio no disponible'}
                                </p>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {payment.paidAt && format(new Date(payment.paidAt), 'dd MMM yyyy HH:mm', { locale: es })}
                            </div>
                            {payment.paymentMethod && (
                              <div className="text-sm text-gray-600 mt-1">
                                Método: {payment.paymentMethod}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews */}
              {customer.reviews && customer.reviews.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Reseñas Enviadas ({customer.reviews.length})
                  </h3>
                  <div className="space-y-4">
                    {customer.reviews.map((review: any) => (
                      <div key={review.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center">
                              <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                              <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Para: {review.washer?.name || 'Lavador no disponible'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: es })}
                          </p>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {onEdit && (
                  <button
                    onClick={() => onEdit(customerId)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiEdit className="mr-2" />
                    Editar
                  </button>
                )}
                {onDeactivate && customer.customer.isActive && (
                  <button
                    onClick={() => onDeactivate(customerId)}
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                  >
                    <FiAlertCircle className="mr-2" />
                    Desactivar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(customerId)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <FiTrash2 className="mr-2" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
