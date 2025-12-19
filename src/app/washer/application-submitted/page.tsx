'use client';

import Link from 'next/link';
import { FiCheckCircle, FiMail, FiClock, FiHome } from 'react-icons/fi';

export default function ApplicationSubmittedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-6">
              <FiCheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              ¡Solicitud Enviada con Éxito!
            </h1>
            <p className="text-lg text-gray-600">
              Gracias por tu interés en unirte a nuestra plataforma como lavador
            </p>
          </div>

          {/* Information Cards */}
          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
              <FiMail className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Revisa tu Email
                </h3>
                <p className="text-sm text-blue-800">
                  Te hemos enviado un correo de confirmación con los detalles de tu solicitud.
                  Revisa también tu carpeta de spam.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
              <FiClock className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Tiempo de Revisión
                </h3>
                <p className="text-sm text-yellow-800">
                  Nuestro equipo revisará tu solicitud en las próximas 24-48 horas.
                  Te notificaremos por email sobre el estado de tu aplicación.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Próximos Pasos
            </h2>
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">Revisión de Documentos</p>
                  <p className="text-sm text-gray-600">
                    Verificaremos tu identificación, seguro y otros documentos
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">Verificación de Referencias</p>
                  <p className="text-sm text-gray-600">
                    Contactaremos a tus referencias si las proporcionaste
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">Decisión de Aprobación</p>
                  <p className="text-sm text-gray-600">
                    Te notificaremos si tu solicitud es aprobada o si necesitamos información adicional
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  4
                </span>
                <div>
                  <p className="font-medium text-gray-900">Configuración de Cuenta</p>
                  <p className="text-sm text-gray-600">
                    Una vez aprobado, te ayudaremos a configurar tu cuenta de lavador
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  5
                </span>
                <div>
                  <p className="font-medium text-gray-900">¡Comienza a Trabajar!</p>
                  <p className="text-sm text-gray-600">
                    Empieza a recibir solicitudes de lavado y ganar dinero
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* FAQ Section */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Cuánto tiempo tarda la aprobación?
                </h3>
                <p className="text-sm text-gray-600">
                  Típicamente entre 24-48 horas. En algunos casos podemos necesitar información adicional,
                  lo cual podría extender el proceso.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Puedo editar mi solicitud?
                </h3>
                <p className="text-sm text-gray-600">
                  Si necesitas hacer cambios, contáctanos directamente. No puedes editar la solicitud
                  una vez enviada.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Qué pasa si mi solicitud es rechazada?
                </h3>
                <p className="text-sm text-gray-600">
                  Te explicaremos los motivos del rechazo. En algunos casos, podrás volver a aplicar
                  después de resolver los problemas identificados.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              ¿Tienes preguntas?
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              Si tienes alguna duda sobre tu solicitud o el proceso, no dudes en contactarnos:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <strong>Email:</strong> support@carwash.com
              </p>
              <p className="text-gray-700">
                <strong>Teléfono:</strong> (555) 123-4567
              </p>
              <p className="text-gray-700">
                <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FiHome className="w-5 h-5 mr-2" />
              Ir a Inicio
            </Link>
            <a
              href="mailto:support@carwash.com"
              className="flex-1 flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <FiMail className="w-5 h-5 mr-2" />
              Contactar Soporte
            </a>
          </div>
        </div>

        {/* Additional Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Número de Referencia: Revisa tu email para obtener tu número de referencia de solicitud
          </p>
        </div>
      </div>
    </div>
  );
}
