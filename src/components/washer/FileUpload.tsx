'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiX, FiFile, FiCheck } from 'react-icons/fi';

interface FileUploadProps {
  label: string;
  accept?: string;
  required?: boolean;
  onChange: (url: string) => void;
  value?: string;
  folder?: string;
  description?: string;
}

export default function FileUpload({
  label,
  accept = 'image/*,.pdf,.doc,.docx',
  required = false,
  onChange,
  value,
  folder = 'washer-applications',
  description,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo no debe superar 10MB');
      return;
    }

    setError('');
    setUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError('Error al subir el archivo. Intenta de nuevo.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}

      <div className="relative">
        {!value ? (
          <label
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploading
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
              {uploading ? (
                <p className="text-sm text-blue-600 font-medium">Subiendo...</p>
              ) : (
                <>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF (MAX. 10MB)
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={value}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <FiFile className="w-12 h-12 text-blue-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {fileName || 'Archivo subido'}
                </p>
                <div className="flex items-center text-xs text-green-600">
                  <FiCheck className="w-4 h-4 mr-1" />
                  Subido correctamente
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
