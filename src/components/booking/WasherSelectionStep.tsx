'use client';

import { useState, useEffect } from 'react';
import { FiZap, FiList, FiStar, FiMapPin, FiUser, FiBriefcase } from 'react-icons/fi';
import WasherSelector from './WasherSelector';
import { toast } from 'react-hot-toast';

type SelectionMode = 'automatic' | 'manual' | 'favorites';

interface WasherPreview {
  id: string;
  name: string;
  email: string;
  rating: number;
  totalReviews: number;
  totalJobs: number;
  profileImage?: string;
  distanceKm: number;
  score: number;
}

interface FavoriteWasher {
  id: string;
  name: string;
  email: string;
  rating: number;
  totalReviews: number;
  totalJobs: number;
  profileImage?: string;
  distanceKm: number;
  yourAverageRating: number;
  servicesWithYou: number;
  lastService: {
    date: string;
    serviceName: string;
    rating: number;
  };
}

interface WasherSelectionStepProps {
  address: {
    latitude: number;
    longitude: number;
  };
  onWasherSelected: (washerId: string | null, mode: SelectionMode) => void;
  selectedWasherId?: string | null;
}

export default function WasherSelectionStep({
  address,
  onWasherSelected,
  selectedWasherId,
}: WasherSelectionStepProps) {
  const [mode, setMode] = useState<SelectionMode>('automatic');
  const [loading, setLoading] = useState(false);
  const [washerPreview, setWasherPreview] = useState<WasherPreview | null>(null);
  const [favoriteWashers, setFavoriteWashers] = useState<FavoriteWasher[]>([]);
  const [favoritesMessage, setFavoritesMessage] = useState<string | null>(null);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<string | null>(null);

  // Load washer preview for automatic mode
  useEffect(() => {
    if (mode === 'automatic') {
      loadWasherPreview();
    }
  }, [mode, address]);

  // Load favorite washers when mode changes
  useEffect(() => {
    if (mode === 'favorites') {
      loadFavoriteWashers();
    }
  }, [mode, address]);

  // Notify parent when mode or selection changes
  useEffect(() => {
    if (mode === 'automatic') {
      onWasherSelected(null, 'automatic');
    } else if (mode === 'manual' && selectedWasherId) {
      onWasherSelected(selectedWasherId, 'manual');
    } else if (mode === 'favorites' && selectedFavoriteId) {
      onWasherSelected(selectedFavoriteId, 'favorites');
    }
  }, [mode, selectedWasherId, selectedFavoriteId]);

  const loadWasherPreview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings/washer-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: address.latitude,
          longitude: address.longitude,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWasherPreview(data.washer);
      } else {
        const error = await response.json();
        toast.error(error.error || 'No hay lavadores disponibles');
        setWasherPreview(null);
      }
    } catch (error) {
      console.error('Error loading washer preview:', error);
      toast.error('Error al cargar lavador');
      setWasherPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteWashers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings/favorite-washers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: address.latitude,
          longitude: address.longitude,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteWashers(data.washers);
        setFavoritesMessage(data.message);
      } else {
        setFavoriteWashers([]);
        setFavoritesMessage('Error al cargar favoritos');
      }
    } catch (error) {
      console.error('Error loading favorite washers:', error);
      setFavoriteWashers([]);
      setFavoritesMessage('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: SelectionMode) => {
    setMode(newMode);
    setSelectedFavoriteId(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Seleccionar Lavador
        </h3>

        {/* Selection Mode Options */}
        <div className="space-y-3">
          {/* OPTION 1: Automatic Assignment */}
          <label
            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
              mode === 'automatic'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="washer-mode"
              value="automatic"
              checked={mode === 'automatic'}
              onChange={() => handleModeChange('automatic')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <FiZap className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  Asignación Automática
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  Recomendado
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Dejar que el sistema elija el mejor lavador disponible
              </p>

              {/* Preview of automatic washer */}
              {mode === 'automatic' && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : washerPreview ? (
                    <div className="flex items-center gap-3">
                      {washerPreview.profileImage ? (
                        <img
                          src={washerPreview.profileImage}
                          alt={washerPreview.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {getInitials(washerPreview.name)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {washerPreview.name}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {washerPreview.rating.toFixed(1)} ({washerPreview.totalReviews})
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-4 h-4" />
                            {washerPreview.distanceKm} km
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Mejor Match
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600 text-center py-2">
                      No hay lavadores disponibles en tu área
                    </p>
                  )}
                </div>
              )}
            </div>
          </label>

          {/* OPTION 2: Manual Selection */}
          <label
            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
              mode === 'manual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="washer-mode"
              value="manual"
              checked={mode === 'manual'}
              onChange={() => handleModeChange('manual')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <FiList className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Elegir Manualmente</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Ver y seleccionar entre los mejores lavadores disponibles
              </p>
            </div>
          </label>

          {/* OPTION 3: Favorites */}
          <label
            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
              mode === 'favorites'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="washer-mode"
              value="favorites"
              checked={mode === 'favorites'}
              onChange={() => handleModeChange('favorites')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <FiStar className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-gray-900">Elegir de Mis Favoritos</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Lavadores que ya te han dado servicio con buena calificación
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Manual Selection - WasherSelector */}
      {mode === 'manual' && (
        <div className="mt-6">
          <WasherSelector
            address={address}
            onWasherSelected={(washerId) => onWasherSelected(washerId, 'manual')}
            selectedWasherId={selectedWasherId || undefined}
          />
        </div>
      )}

      {/* Favorites Selection */}
      {mode === 'favorites' && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Tus Lavadores Favoritos</h4>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : favoriteWashers.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FiStar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                {favoritesMessage || 'No tienes lavadores favoritos disponibles en este momento'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Los favoritos son lavadores que te han dado servicio con calificación de 4+ estrellas
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {favoriteWashers.map((washer) => (
                <label
                  key={washer.id}
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedFavoriteId === washer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="favorite-washer"
                    value={washer.id}
                    checked={selectedFavoriteId === washer.id}
                    onChange={() => setSelectedFavoriteId(washer.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-start gap-3">
                      {washer.profileImage ? (
                        <img
                          src={washer.profileImage}
                          alt={washer.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold text-lg">
                          {getInitials(washer.name)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{washer.name}</h5>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>
                              Tu calificación: <strong>{washer.yourAverageRating}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <FiBriefcase className="w-4 h-4" />
                            <span>{washer.servicesWithYou} servicios</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <FiMapPin className="w-4 h-4" />
                            <span>{washer.distanceKm} km de distancia</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <FiUser className="w-4 h-4" />
                            <span>Rating: {washer.rating.toFixed(1)} ⭐</span>
                          </div>
                        </div>

                        {/* Last service */}
                        <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Último servicio:</p>
                          <p className="text-sm text-gray-700">
                            <strong>{washer.lastService.serviceName}</strong> -{' '}
                            {formatDate(washer.lastService.date)}
                            <span className="ml-2">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={
                                    i < washer.lastService.rating
                                      ? 'text-yellow-500'
                                      : 'text-gray-300'
                                  }
                                >
                                  ⭐
                                </span>
                              ))}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
