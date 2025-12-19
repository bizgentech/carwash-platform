'use client';

import { useEffect, useState } from 'react';
import { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiDollarSign, FiStar, FiCheck, FiClock, FiImage, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export default function BookingDetailModal({
  isOpen,
  onClose,
  bookingId,
}: BookingDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoModal, setPhotoModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
    }
  }, [isOpen, bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (!response.ok) throw new Error('Failed to fetch booking details');
      const bookingData = await response.json();
      setData(bookingData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openPhotoModal = (url: string, title: string) => {
    setPhotoModal({ isOpen: true, url, title });
  };

  const closePhotoModal = () => {
    setPhotoModal({ isOpen: false, url: '', title: '' });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Detalle de la Reserva</h2>
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
            ) : data ? (
              <div className="space-y-6">
                {/* Status and ID */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">ID de Reserva</p>
                    <p className="font-mono text-sm text-gray-900">{data.booking.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    data.booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    data.booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    data.booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    data.booking.status === 'ON_THE_WAY' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {data.booking.status}
                  </span>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline del Servicio</h3>
                  <div className="relative">
                    {data.timeline.map((step: any, index: number) => (
                      <div key={step.status} className="flex items-start mb-8 last:mb-0">
                        <div className="flex flex-col items-center mr-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {step.completed ? (
                              <FiCheck className="w-5 h-5 text-white" />
                            ) : (
                              <FiClock className="w-5 h-5 text-white" />
                            )}
                          </div>
                          {index < data.timeline.length - 1 && (
                            <div className={`w-0.5 h-16 mt-2 ${
                              step.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                          {step.timestamp && (
                            <p className="text-sm text-gray-600">
                              {format(new Date(step.timestamp), 'dd MMM yyyy HH:mm', { locale: es })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Servicio</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Servicio</label>
                        <p className="font-medium text-gray-900">{data.service.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Tipo</label>
                        <p className="font-medium text-gray-900">{data.service.type}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Descripción</label>
                        <p className="text-sm text-gray-700">{data.service.description}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Duración Estimada</label>
                        <p className="font-medium text-gray-900">{data.service.duration} minutos</p>
                      </div>
                      {data.service.features && data.service.features.length > 0 && (
                        <div>
                          <label className="text-sm text-gray-600">Características</label>
                          <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                            {data.service.features.map((feature: string, idx: number) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUser className="mr-2" />
                        Cliente
                      </h3>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">{data.customer.name}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <FiMail className="mr-2" />
                          {data.customer.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <FiPhone className="mr-2" />
                          {data.customer.phone || 'No registrado'}
                        </p>
                      </div>
                    </div>

                    {/* Washer Info */}
                    {data.washer && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FiUser className="mr-2" />
                          Lavador Asignado
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{data.washer.name}</p>
                            <div className="flex items-center">
                              <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="text-sm font-medium">{data.washer.rating?.toFixed(1) || 'N/A'}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center">
                            <FiMail className="mr-2" />
                            {data.washer.email}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <FiPhone className="mr-2" />
                            {data.washer.phone || 'No registrado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Trabajos completados: {data.washer.totalJobs || 0}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle and Address */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vehicle */}
                  {data.vehicle && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehículo</h3>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">
                          {data.vehicle.year} {data.vehicle.make} {data.vehicle.model}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>Color: {data.vehicle.color}</div>
                          <div>Placa: {data.vehicle.plateNumber}</div>
                          <div className="col-span-2">Tamaño: {data.vehicle.size}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {data.address && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiMapPin className="mr-2" />
                        Dirección del Servicio
                      </h3>
                      <div className="space-y-1 text-gray-700">
                        <p>{data.address.street}</p>
                        {data.address.apartment && <p>Apt/Suite: {data.address.apartment}</p>}
                        <p>{data.address.city}, {data.address.state} {data.address.zipCode}</p>
                        {data.address.instructions && (
                          <p className="text-sm text-gray-600 mt-2">
                            Instrucciones: {data.address.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Information */}
                {data.serviceFee && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiDollarSign className="mr-2" />
                      Desglose de Pago
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal del servicio:</span>
                        <span className="font-medium">${data.serviceFee.subtotal.toFixed(2)}</span>
                      </div>
                      {data.serviceFee.tip > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span>Propina:</span>
                          <span className="font-medium text-green-600">+${data.serviceFee.tip.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-700 pt-2 border-t border-green-200">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg">${data.serviceFee.total.toFixed(2)}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-green-200 space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Comisión de plataforma:</span>
                          <span>${data.serviceFee.platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pago al lavador:</span>
                          <span>${data.serviceFee.washerAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photos */}
                {(data.booking.beforePhoto || data.booking.afterPhoto) && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiImage className="mr-2" />
                      Fotos del Servicio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.booking.beforePhoto && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Antes</p>
                          <div
                            onClick={() => openPhotoModal(data.booking.beforePhoto, 'Foto Antes')}
                            className="cursor-pointer relative aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={data.booking.beforePhoto}
                              alt="Before"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      {data.booking.afterPhoto && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Después</p>
                          <div
                            onClick={() => openPhotoModal(data.booking.afterPhoto, 'Foto Después')}
                            className="cursor-pointer relative aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={data.booking.afterPhoto}
                              alt="After"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {data.booking.photosApproved !== null && (
                      <p className={`mt-2 text-sm ${
                        data.booking.photosApproved ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        Estado: {data.booking.photosApproved ? 'Fotos aprobadas' : 'Pendiente de aprobación'}
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                {(data.booking.customerNotes || data.booking.washerNotes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.booking.customerNotes && (
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Notas del Cliente</h3>
                        <p className="text-sm text-gray-700">{data.booking.customerNotes}</p>
                      </div>
                    )}
                    {data.booking.washerNotes && (
                      <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Notas del Lavador</h3>
                        <p className="text-sm text-gray-700">{data.booking.washerNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Review */}
                {data.review && (
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiStar className="mr-2 text-yellow-500" />
                      Reseña
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-xl">
                          {'★'.repeat(data.review.rating)}
                        </span>
                        <span className="text-gray-300 text-xl">
                          {'★'.repeat(5 - data.review.rating)}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          por {data.review.reviewer?.name || 'Usuario'}
                        </span>
                      </div>
                      {data.review.comment && (
                        <p className="text-gray-700 mt-2">{data.review.comment}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Creada</label>
                      <p className="font-medium text-gray-900">
                        {format(new Date(data.booking.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Programada para</label>
                      <p className="font-medium text-gray-900">
                        {format(new Date(data.booking.scheduledFor), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    {data.booking.startedAt && (
                      <div>
                        <label className="text-gray-600">Iniciada</label>
                        <p className="font-medium text-gray-900">
                          {format(new Date(data.booking.startedAt), 'dd MMM yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    )}
                    {data.booking.completedAt && (
                      <div>
                        <label className="text-gray-600">Completada</label>
                        <p className="font-medium text-gray-900">
                          {format(new Date(data.booking.completedAt), 'dd MMM yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {photoModal.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
          onClick={closePhotoModal}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <FiX className="w-8 h-8" />
            </button>
            <img
              src={photoModal.url}
              alt={photoModal.title}
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-center mt-4 text-lg">{photoModal.title}</p>
          </div>
        </div>
      )}
    </>
  );
}
