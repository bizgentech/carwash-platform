'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiMapPin, FiAward, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface WasherMatch {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  rating: number;
  totalJobs: number;
  totalReviews: number;
  distanceKm: number;
  score: number;
  isBestMatch: boolean;
  rank: number;
  recentReviews: Array<{
    rating: number;
    comment?: string;
    createdAt: string;
    reviewer: { name: string };
  }>;
}

interface WasherSelectorProps {
  latitude?: number;
  longitude?: number;
  address?: {
    latitude: number;
    longitude: number;
  };
  onSelect?: (washerId: string) => void;
  onWasherSelected?: (washerId: string) => void;
  selectedWasherId?: string;
}

export default function WasherSelector({
  latitude: propLatitude,
  longitude: propLongitude,
  address,
  onSelect,
  onWasherSelected,
  selectedWasherId,
}: WasherSelectorProps) {
  // Support both prop formats
  const latitude = address?.latitude ?? propLatitude;
  const longitude = address?.longitude ?? propLongitude;
  const handleSelect = onWasherSelected ?? onSelect;
  const [washers, setWashers] = useState<WasherMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedWasher, setExpandedWasher] = useState<string | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      fetchMatchingWashers();
    }
  }, [latitude, longitude]);

  const fetchMatchingWashers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings/match-washers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, limit: 5 }),
      });

      if (!response.ok) {
        throw new Error('Error al buscar lavadores disponibles');
      }

      const data = await response.json();
      setWashers(data.washers || []);

      // Auto-select best match if no selection made
      if (!selectedWasherId && data.washers.length > 0 && handleSelect) {
        handleSelect(data.washers[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching washers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Buscando lavadores disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <FiAlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (washers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 font-medium">No hay lavadores disponibles en tu zona</p>
          <p className="text-yellow-700 text-sm mt-1">
            Por favor intenta más tarde o selecciona otra ubicación
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Lavadores Disponibles ({washers.length})
        </h3>
        <p className="text-sm text-gray-600">Ordenados por mejor match</p>
      </div>

      <div className="space-y-3">
        {washers.map((washer) => (
          <div
            key={washer.id}
            onClick={() => handleSelect?.(washer.id)}
            className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
              selectedWasherId === washer.id
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Profile Image */}
                  {washer.profileImage ? (
                    <img
                      src={washer.profileImage}
                      alt={washer.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xl">
                        {washer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{washer.name}</h4>
                      {washer.isBestMatch && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FiAward className="w-3 h-3 mr-1" />
                          Mejor Match
                        </span>
                      )}
                      <span className="text-xs text-gray-500">#{washer.rank}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">{washer.rating.toFixed(1)}</span>
                        <span className="text-gray-400 ml-1">({washer.totalReviews})</span>
                      </div>
                      <div className="flex items-center">
                        <FiMapPin className="w-4 h-4 mr-1" />
                        <span>{washer.distanceKm} km</span>
                      </div>
                      <div>
                        {washer.totalJobs} trabajos
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${washer.score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {Math.round(washer.score * 100)}% match
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedWasherId === washer.id && (
                  <FiCheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                )}
              </div>

              {/* Expandable Reviews */}
              {washer.recentReviews.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedWasher(expandedWasher === washer.id ? null : washer.id);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {expandedWasher === washer.id ? 'Ocultar' : 'Ver'} reseñas recientes
                  </button>

                  {expandedWasher === washer.id && (
                    <div className="mt-3 space-y-2">
                      {washer.recentReviews.slice(0, 3).map((review, idx) => (
                        <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              {'★'.repeat(review.rating)}
                              <span className="text-gray-400">
                                {'★'.repeat(5 - review.rating)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.reviewer.name}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 text-xs">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedWasherId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <FiCheckCircle className="w-4 h-4 inline mr-1" />
            Lavador seleccionado. Puedes cambiar tu selección haciendo click en otro lavador.
          </p>
        </div>
      )}
    </div>
  );
}
