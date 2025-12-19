'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import FileUpload from '@/components/washer/FileUpload';
import { FiUser, FiBriefcase, FiFileText, FiCreditCard, FiUsers, FiCheckCircle } from 'react-icons/fi';

interface FormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;

  // Business Information
  businessName: string;
  serviceType: 'MOBILE' | 'FIXED' | 'BOTH';
  yearsExperience: number;
  description: string;

  // Documents
  idDocument: string;
  insuranceProof: string;
  vehiclePhoto: string;
  businessLogo: string;
  certificates: string[];

  // Payment Information
  paymentType: 'BANK_ACCOUNT' | 'PAYPAL' | 'STRIPE' | 'OTHER';
  bankName: string;
  accountHolderName: string;
  routingNumber: string;
  accountNumber: string;
  paypalEmail: string;
  stripeEmail: string;
  otherPaymentDetails: string;

  // References
  reference1Name: string;
  reference1Phone: string;
  reference1Email: string;
  reference2Name: string;
  reference2Phone: string;
  reference2Email: string;

  // Terms
  termsAccepted: boolean;
}

const STEPS = [
  { id: 1, name: 'Información Personal', icon: FiUser },
  { id: 2, name: 'Información del Negocio', icon: FiBriefcase },
  { id: 3, name: 'Documentos', icon: FiFileText },
  { id: 4, name: 'Información de Pago', icon: FiCreditCard },
  { id: 5, name: 'Referencias', icon: FiUsers },
  { id: 6, name: 'Términos y Condiciones', icon: FiCheckCircle },
];

export default function WasherRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    businessName: '',
    serviceType: 'MOBILE',
    yearsExperience: 0,
    description: '',
    idDocument: '',
    insuranceProof: '',
    vehiclePhoto: '',
    businessLogo: '',
    certificates: [],
    paymentType: 'BANK_ACCOUNT',
    bankName: '',
    accountHolderName: '',
    routingNumber: '',
    accountNumber: '',
    paypalEmail: '',
    stripeEmail: '',
    otherPaymentDetails: '',
    reference1Name: '',
    reference1Phone: '',
    reference1Email: '',
    reference2Name: '',
    reference2Phone: '',
    reference2Email: '',
    termsAccepted: false,
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone ||
            !formData.street || !formData.city || !formData.state || !formData.zipCode) {
          toast.error('Por favor completa todos los campos obligatorios');
          return false;
        }
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error('Por favor ingresa un email válido');
          return false;
        }
        return true;

      case 2:
        if (!formData.serviceType || formData.yearsExperience < 0 || !formData.description) {
          toast.error('Por favor completa todos los campos obligatorios');
          return false;
        }
        return true;

      case 3:
        if (!formData.idDocument || !formData.insuranceProof) {
          toast.error('Debes subir tu identificación oficial y prueba de seguro');
          return false;
        }
        if (!formData.vehiclePhoto && !formData.businessLogo) {
          toast.error('Debes subir la foto de tu vehículo O el logo de tu negocio');
          return false;
        }
        return true;

      case 4:
        if (!formData.paymentType) {
          toast.error('Selecciona un tipo de cuenta de pago');
          return false;
        }
        if (formData.paymentType === 'BANK_ACCOUNT') {
          if (!formData.bankName || !formData.accountHolderName ||
              !formData.routingNumber || !formData.accountNumber) {
            toast.error('Por favor completa toda la información bancaria');
            return false;
          }
        } else if (formData.paymentType === 'PAYPAL' && !formData.paypalEmail) {
          toast.error('Por favor ingresa tu email de PayPal');
          return false;
        } else if (formData.paymentType === 'STRIPE' && !formData.stripeEmail) {
          toast.error('Por favor ingresa tu email de Stripe');
          return false;
        }
        return true;

      case 5:
        // References are optional
        return true;

      case 6:
        if (!formData.termsAccepted) {
          toast.error('Debes aceptar los términos y condiciones');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(6)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/washer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al enviar la solicitud');
      }

      toast.success('¡Solicitud enviada correctamente!');
      router.push('/washer/application-submitted');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Home Button */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a
              href="/"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-semibold"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Inicio</span>
            </a>
            <span className="text-sm text-gray-600">Registro de Lavador</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Únete como Lavador
          </h1>
          <p className="text-lg text-gray-600">
            Completa el formulario para aplicar y comenzar a ganar dinero
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 text-center hidden md:block">
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Información Personal
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="juan@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => updateFormData('street', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Calle Principal"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ciudad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Estado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => updateFormData('zipCode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Información del Negocio/Servicio
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Negocio (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateFormData('businessName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto Lavado Express"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Servicio <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => updateFormData('serviceType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MOBILE">Móvil (Voy al cliente)</option>
                    <option value="FIXED">Fijo (Tengo ubicación física)</option>
                    <option value="BOTH">Ambos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Años de Experiencia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.yearsExperience}
                    onChange={(e) => updateFormData('yearsExperience', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Breve del Servicio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe tu servicio, especialidades, y qué te hace destacar..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Documentos
                </h2>

                <FileUpload
                  label="Identificación Oficial (ID/Licencia)"
                  required
                  value={formData.idDocument}
                  onChange={(url) => updateFormData('idDocument', url)}
                  folder="washer-applications/id-documents"
                  description="Sube una foto clara de tu identificación oficial o licencia de conducir"
                />

                <FileUpload
                  label="Prueba de Seguro del Vehículo"
                  required
                  value={formData.insuranceProof}
                  onChange={(url) => updateFormData('insuranceProof', url)}
                  folder="washer-applications/insurance"
                  description="Sube tu póliza de seguro vigente"
                />

                <FileUpload
                  label="Foto del Vehículo de Trabajo"
                  value={formData.vehiclePhoto}
                  onChange={(url) => updateFormData('vehiclePhoto', url)}
                  folder="washer-applications/vehicles"
                  description="Sube una foto de tu vehículo de trabajo (si ofreces servicio móvil)"
                  accept="image/*"
                />

                <FileUpload
                  label="Logo del Negocio"
                  value={formData.businessLogo}
                  onChange={(url) => updateFormData('businessLogo', url)}
                  folder="washer-applications/logos"
                  description="Sube el logo de tu negocio (si tienes uno)"
                  accept="image/*"
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Debes subir al menos la foto de tu vehículo O el logo de tu negocio.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Payment Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Información de Pago
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cuenta <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => updateFormData('paymentType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="BANK_ACCOUNT">Cuenta Bancaria</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="STRIPE">Stripe</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                {formData.paymentType === 'BANK_ACCOUNT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Banco <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => updateFormData('bankName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Banco Nacional"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Titular de la Cuenta <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.accountHolderName}
                        onChange={(e) => updateFormData('accountHolderName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Juan Pérez"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Routing <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.routingNumber}
                          onChange={(e) => updateFormData('routingNumber', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="123456789"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Cuenta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) => updateFormData('accountNumber', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.paymentType === 'PAYPAL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de PayPal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.paypalEmail}
                      onChange={(e) => updateFormData('paypalEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@paypal.com"
                    />
                  </div>
                )}

                {formData.paymentType === 'STRIPE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Stripe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.stripeEmail}
                      onChange={(e) => updateFormData('stripeEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@stripe.com"
                    />
                  </div>
                )}

                {formData.paymentType === 'OTHER' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detalles del Método de Pago
                    </label>
                    <textarea
                      value={formData.otherPaymentDetails}
                      onChange={(e) => updateFormData('otherPaymentDetails', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe tu método de pago preferido..."
                    />
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota de Seguridad:</strong> Tu información bancaria está encriptada y segura. Nunca compartiremos tus datos con terceros.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: References */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Referencias Profesionales (Opcional)
                </h2>

                <p className="text-gray-600 mb-4">
                  Proporciona hasta 2 referencias profesionales que puedan validar tu experiencia y profesionalismo.
                </p>

                {/* Reference 1 */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Referencia 1</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formData.reference1Name}
                      onChange={(e) => updateFormData('reference1Name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="María García"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.reference1Phone}
                        onChange={(e) => updateFormData('reference1Phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 987-6543"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.reference1Email}
                        onChange={(e) => updateFormData('reference1Email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="maria@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Reference 2 */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Referencia 2</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formData.reference2Name}
                      onChange={(e) => updateFormData('reference2Name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Carlos López"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.reference2Phone}
                        onChange={(e) => updateFormData('reference2Phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 321-7654"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.reference2Email}
                        onChange={(e) => updateFormData('reference2Email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="carlos@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Terms and Conditions */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Términos y Condiciones
                </h2>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-lg mb-4">Acuerdo de Lavador</h3>

                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      Al aceptar estos términos, confirmas que:
                    </p>

                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Toda la información proporcionada es verdadera y precisa</li>
                      <li>Tienes un seguro válido para tu vehículo y operaciones</li>
                      <li>Cumplirás con todos los estándares de calidad de servicio</li>
                      <li>Mantendrás una comunicación profesional con los clientes</li>
                      <li>Entiendes que la plataforma cobra una comisión del 20% por cada servicio</li>
                      <li>Los pagos se procesarán de acuerdo a los términos establecidos</li>
                      <li>Puedes ser suspendido o eliminado por violar las políticas</li>
                      <li>Proporcionarás fotos antes y después de cada servicio</li>
                      <li>Cumplirás con los horarios acordados con los clientes</li>
                      <li>Mantendrás tu perfil y disponibilidad actualizados</li>
                    </ul>

                    <p className="mt-4">
                      <strong>Proceso de Aprobación:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Tu solicitud será revisada en 24-48 horas</li>
                      <li>Verificaremos tus documentos y referencias</li>
                      <li>Podemos solicitar información adicional si es necesario</li>
                      <li>Recibirás un email con la decisión</li>
                    </ul>

                    <p className="mt-4">
                      <strong>Responsabilidades:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Eres responsable de tus propios impuestos</li>
                      <li>Debes mantener tu propio seguro y licencias</li>
                      <li>La plataforma no te emplea directamente (contratista independiente)</li>
                      <li>Debes cumplir con todas las leyes locales aplicables</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.termsAccepted}
                    onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                    He leído y acepto los términos y condiciones, políticas de privacidad, y acuerdo de lavador.
                    Confirmo que toda la información proporcionada es verdadera y precisa.
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
              )}

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Current Step Indicator (Mobile) */}
        <div className="text-center mt-4 md:hidden">
          <p className="text-sm text-gray-600">
            Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
        </div>
      </div>
    </div>
  );
}
