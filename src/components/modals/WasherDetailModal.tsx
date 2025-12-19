'use client';

import { useEffect, useState } from 'react';
import { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiDollarSign, FiStar, FiBriefcase, FiFileText, FiDownload, FiEye, FiEdit, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WasherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  washerId: string;
  onEdit?: (washerId: string) => void;
  onDeactivate?: (washerId: string) => void;
  onDelete?: (washerId: string) => void;
}

export default function WasherDetailModal({
  isOpen,
  onClose,
  washerId,
  onEdit,
  onDeactivate,
  onDelete,
}: WasherDetailModalProps) {
  const [washer, setWasher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'bookings' | 'payments'>('info');

  useEffect(() => {
    if (isOpen && washerId) {
      fetchWasherDetails();
    }
  }, [isOpen, washerId]);

  const fetchWasherDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/washers/${washerId}/details`);
      if (!response.ok) throw new Error('Failed to fetch washer details');
      const data = await response.json();
      setWasher(data);
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
          <h2 className="text-2xl font-bold text-gray-900">Detalle del Lavador</h2>
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
          ) : washer ? (
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
                      <p className="font-medium text-gray-900">{washer.washer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium text-gray-900 flex items-center">
                        <FiMail className="mr-2 text-gray-400" />
                        {washer.washer.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Teléfono</label>
                      <p className="font-medium text-gray-900 flex items-center">
                        <FiPhone className="mr-2 text-gray-400" />
                        {washer.washer.phone || 'No registrado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Dirección</label>
                      <p className="font-medium text-gray-900 flex items-center">
                        <FiMapPin className="mr-2 text-gray-400" />
                        {washer.washer.address || 'No registrada'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Estado</label>
                      <p className="font-medium">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          washer.washer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {washer.washer.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Aprobado</label>
                      <p className="font-medium">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          washer.washer.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {washer.washer.isApproved ? 'Sí' : 'Pendiente'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Rating</p>
                        <p className="text-2xl font-bold text-blue-900 flex items-center">
                          <FiStar className="mr-1 fill-yellow-400 text-yellow-400" />
                          {washer.stats.averageRating.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Trabajos Completados</p>
                        <p className="text-2xl font-bold text-green-900 flex items-center">
                          <FiBriefcase className="mr-1" />
                          {washer.stats.completedJobs}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Ganancias Totales</p>
                        <p className="text-2xl font-bold text-purple-900 flex items-center">
                          <FiDollarSign className="mr-1" />
                          ${washer.stats.totalEarnings.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600">Tasa de Finalización</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {washer.stats.completionRate.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              {washer.jobsByMonth && washer.jobsByMonth.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Rendimiento (Trabajos por Mes)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={washer.jobsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="jobs"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Trabajos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Documents */}
              {washer.washer.documents && washer.washer.documents.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiFileText className="mr-2" />
                    Documentos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {washer.washer.documents.map((doc: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-900 mb-2">{doc.type}</p>
                        <div className="flex gap-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <FiEye className="mr-1" />
                            Ver
                          </a>
                          <a
                            href={doc.url}
                            download
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <FiDownload className="mr-1" />
                            Descargar
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs for Bookings and Payments */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'bookings'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Últimas Reservas ({washer.recentBookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'payments'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Historial de Pagos ({washer.payments.length})
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'bookings' && (
                    <div className="space-y-4">
                      {washer.recentBookings.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay reservas registradas</p>
                      ) : (
                        washer.recentBookings.map((booking: any) => (
                          <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{booking.service.name}</p>
                                <p className="text-sm text-gray-600">{booking.customer.name}</p>
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
                              <div>Fecha: {format(new Date(booking.scheduledFor), 'dd MMM yyyy', { locale: es })}</div>
                              <div>Precio: ${booking.price.toFixed(2)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'payments' && (
                    <div className="space-y-4">
                      {washer.payments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay pagos registrados</p>
                      ) : (
                        washer.payments.map((payment: any) => (
                          <div key={payment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900">
                                  ${payment.washerAmount.toFixed(2)}
                                  {payment.tip > 0 && (
                                    <span className="text-green-600 text-sm ml-2">
                                      +${payment.tip.toFixed(2)} propina
                                    </span>
                                  )}
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
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {onEdit && (
                  <button
                    onClick={() => onEdit(washerId)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiEdit className="mr-2" />
                    Editar
                  </button>
                )}
                {onDeactivate && washer.washer.isActive && (
                  <button
                    onClick={() => onDeactivate(washerId)}
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                  >
                    <FiAlertCircle className="mr-2" />
                    Desactivar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(washerId)}
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
