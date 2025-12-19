'use client';

import { useState, useEffect } from 'react';
import { FiMapPin, FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CoverageSettingsProps {
  washerId: string;
}

export default function CoverageSettings({ washerId }: CoverageSettingsProps) {
  const [serviceRadius, setServiceRadius] = useState(10);
  const [preferredAreas, setPreferredAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    fetchCoverageSettings();
  }, [washerId]);

  const fetchCoverageSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/washer/coverage?washerId=${washerId}`);
      if (response.ok) {
        const data = await response.json();
        setServiceRadius(data.serviceRadius || 10);
        setPreferredAreas(data.preferredAreas || []);
        setHasLocation(!!(data.latitude && data.longitude));
      }
    } catch (error) {
      console.error('Error fetching coverage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/washer/coverage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          washerId,
          serviceRadius,
          preferredAreas,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar configuración');
      }

      toast.success('Configuración guardada exitosamente');
    } catch (error: any) {
      console.error('Error saving coverage:', error);
      toast.error(error.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleAddArea = () => {
    const area = newArea.trim();
    if (area && !preferredAreas.includes(area)) {
      setPreferredAreas([...preferredAreas, area]);
      setNewArea('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setPreferredAreas(preferredAreas.filter(a => a !== area));
  };

  const updateLocation = async () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      toast.loading('Obteniendo tu ubicación...', { id: 'location' });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch('/api/washer/location', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                washerId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            });

            if (!response.ok) {
              throw new Error('Error al actualizar ubicación');
            }

            setHasLocation(true);
            toast.success('Ubicación actualizada exitosamente', { id: 'location' });
          } catch (error) {
            console.error('Error updating location:', error);
            toast.error('Error al actualizar ubicación', { id: 'location' });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('No se pudo obtener tu ubicación. Verifica los permisos.', { id: 'location' });
          setLoading(false);
        }
      );
    } else {
      toast.error('Tu navegador no soporta geolocalización');
    }
  };

  if (loading && serviceRadius === 10 && preferredAreas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <FiMapPin className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Área de Cobertura</h2>
      </div>

      <div className="space-y-6">
        {/* Location Status */}
        {!hasLocation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-800 font-medium mb-2">
                  No has configurado tu ubicación
                </p>
                <p className="text-yellow-700 text-sm mb-3">
                  Para que los clientes puedan encontrarte, necesitas compartir tu ubicación actual.
                </p>
                <button
                  onClick={updateLocation}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50"
                >
                  Actualizar Ubicación Ahora
                </button>
              </div>
            </div>
          </div>
        )}

        {hasLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiCheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-green-800 font-medium">Ubicación activa</p>
                <button
                  onClick={updateLocation}
                  disabled={loading}
                  className="text-sm text-green-700 hover:text-green-800 mt-1"
                >
                  Actualizar ubicación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Radio de Servicio (km)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="50"
              value={serviceRadius}
              onChange={(e) => setServiceRadius(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="w-20 text-right">
              <span className="text-2xl font-bold text-blue-600">{serviceRadius}</span>
              <span className="text-sm text-gray-600 ml-1">km</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Atenderás servicios dentro de {serviceRadius} km de tu ubicación actual
          </p>
        </div>

        {/* Preferred Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zonas Preferidas (Opcional)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Agrega nombres de ciudades o zonas donde prefieres trabajar
          </p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddArea()}
              placeholder="Ej: Centro, Zona Norte, Polanco..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddArea}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Agregar
            </button>
          </div>

          {preferredAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {preferredAreas.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {area}
                  <button
                    onClick={() => handleRemoveArea(area)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
          >
            <FiSave className="w-5 h-5 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}
