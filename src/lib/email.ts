// Import SendGrid conditionally
let sgMail: any = null;

// Initialize SendGrid only if API key is available
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (error) {
    console.warn('SendGrid not installed or configured');
  }
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@carwash.com';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
  if (!sgMail || !process.env.SENDGRID_API_KEY) {
    console.log('\n====== EMAIL (SendGrid not configured) ======');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', text || html.replace(/<[^>]*>/g, '').substring(0, 200) + '...');
    console.log('===========================================\n');
    return;
  }

  try {
    await sgMail.send({
      to,
      from: FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error, just log it
    console.warn('Email failed to send, but continuing...');
  }
}

/**
 * Send washer application notification to admin
 */
export async function sendWasherApplicationNotification(
  applicationData: {
    fullName: string;
    email: string;
    phone: string;
    businessName?: string;
    serviceType: string;
    yearsExperience: number;
    applicationId: string;
  }
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@carwash.com';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #4b5563; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nueva Solicitud de Lavador</h1>
          </div>
          <div class="content">
            <p>Se ha recibido una nueva solicitud de registro para lavador.</p>

            <div class="info-row">
              <span class="label">Nombre:</span> ${applicationData.fullName}
            </div>
            <div class="info-row">
              <span class="label">Email:</span> ${applicationData.email}
            </div>
            <div class="info-row">
              <span class="label">Teléfono:</span> ${applicationData.phone}
            </div>
            ${applicationData.businessName ? `
            <div class="info-row">
              <span class="label">Negocio:</span> ${applicationData.businessName}
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Tipo de Servicio:</span> ${applicationData.serviceType}
            </div>
            <div class="info-row">
              <span class="label">Años de Experiencia:</span> ${applicationData.yearsExperience}
            </div>

            <p>Por favor revisa la solicitud y apruébala o recházala desde el panel de administración.</p>

            <a href="${process.env.NEXTAUTH_URL}/admin/applications/${applicationData.applicationId}" class="button">
              Ver Solicitud
            </a>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `Nueva Solicitud de Lavador - ${applicationData.fullName}`,
    html,
  });
}

/**
 * Send confirmation email to washer applicant
 */
export async function sendWasherApplicationConfirmation(
  email: string,
  fullName: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Solicitud Recibida!</h1>
          </div>
          <div class="content">
            <p>Hola ${fullName},</p>

            <p>Gracias por enviar tu solicitud para convertirte en lavador de nuestra plataforma.</p>

            <p>Hemos recibido tu información y documentos. Nuestro equipo revisará tu solicitud en las próximas 24-48 horas.</p>

            <p>Te notificaremos por email cuando hayamos tomado una decisión sobre tu solicitud.</p>

            <p><strong>Próximos Pasos:</strong></p>
            <ul>
              <li>Revisión de documentos (24-48 horas)</li>
              <li>Verificación de referencias</li>
              <li>Aprobación o solicitud de información adicional</li>
              <li>Configuración de tu cuenta de lavador</li>
            </ul>

            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

            <p>Saludos,<br>El equipo de CarWash</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático. Por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Solicitud de Lavador Recibida - CarWash',
    html,
  });
}

/**
 * Send washer application approved email
 */
export async function sendWasherApprovedEmail(
  email: string,
  fullName: string,
  temporaryPassword: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .credentials { background-color: #e0f2fe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a CarWash Pro!</h1>
          </div>
          <div class="content">
            <p>¡Hola ${fullName}!</p>

            <p>¡Excelentes noticias! Tu solicitud para convertirte en lavador ha sido <strong>APROBADA</strong>.</p>

            <p>Ya puedes comenzar a recibir solicitudes de lavado y ganar dinero con nuestra plataforma.</p>

            <div class="credentials">
              <p><strong>Tus credenciales de acceso:</strong></p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Contraseña temporal:</strong> ${temporaryPassword}</p>
              <p style="color: #dc2626; margin-top: 10px;"><small>⚠️ Por favor cambia tu contraseña después del primer inicio de sesión.</small></p>
            </div>

            <p><strong>Próximos pasos:</strong></p>
            <ol>
              <li>Inicia sesión en tu dashboard de lavador</li>
              <li>Completa tu perfil y configura tu disponibilidad</li>
              <li>Configura tu método de pago para recibir tus ganancias</li>
              <li>¡Comienza a aceptar solicitudes de lavado!</li>
            </ol>

            <a href="${process.env.NEXTAUTH_URL}/login" class="button">Iniciar Sesión</a>

            <p style="margin-top: 30px;">Recuerda que recibes el 80% de cada servicio completado. Los pagos se procesan semanalmente.</p>

            <p>Si tienes alguna pregunta, estamos aquí para ayudarte.</p>

            <p>¡Bienvenido al equipo!<br>El equipo de CarWash Pro</p>
          </div>
          <div class="footer">
            <p>CarWash Pro - Plataforma de Servicios de Lavado</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: '¡Tu solicitud ha sido aprobada! - CarWash Pro',
    html,
  });
}

/**
 * Send washer application rejected email
 */
export async function sendWasherRejectedEmail(
  email: string,
  fullName: string,
  reason: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .reason-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Actualización de tu Solicitud</h1>
          </div>
          <div class="content">
            <p>Hola ${fullName},</p>

            <p>Gracias por tu interés en unirte a CarWash Pro como lavador.</p>

            <p>Después de revisar cuidadosamente tu solicitud, lamentamos informarte que no podemos aprobarla en este momento.</p>

            <div class="reason-box">
              <p><strong>Motivo:</strong></p>
              <p>${reason}</p>
            </div>

            <p>Apreciamos tu interés en nuestra plataforma. Si la situación cambia o si puedes resolver los puntos mencionados, eres bienvenido a aplicar nuevamente en el futuro.</p>

            <p>Si tienes preguntas sobre esta decisión, por favor no dudes en contactarnos.</p>

            <p>Saludos,<br>El equipo de CarWash Pro</p>
          </div>
          <div class="footer">
            <p>CarWash Pro - Plataforma de Servicios de Lavado</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Actualización sobre tu solicitud - CarWash Pro',
    html,
  });
}

/**
 * Send washer deactivated email
 */
export async function sendWasherDeactivatedEmail(
  email: string,
  fullName: string,
  reason: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .reason-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tu cuenta ha sido desactivada</h1>
          </div>
          <div class="content">
            <p>Hola ${fullName},</p>

            <p>Te informamos que tu cuenta de lavador ha sido <strong>desactivada</strong> temporalmente.</p>

            <div class="reason-box">
              <p><strong>Motivo:</strong></p>
              <p>${reason}</p>
            </div>

            <p>Durante este período:</p>
            <ul>
              <li>No podrás recibir nuevas solicitudes de lavado</li>
              <li>No podrás acceder a tu dashboard de lavador</li>
              <li>Tus servicios activos serán cancelados</li>
            </ul>

            <p>Si crees que esto es un error o deseas discutir esta decisión, por favor contacta a nuestro equipo de soporte lo antes posible.</p>

            <p>Email de soporte: admin@demo.com</p>

            <p>Saludos,<br>El equipo de CarWash Pro</p>
          </div>
          <div class="footer">
            <p>CarWash Pro - Plataforma de Servicios de Lavado</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Tu cuenta ha sido desactivada - CarWash Pro',
    html,
  });
}

/**
 * Send customer deactivated email
 */
export async function sendCustomerDeactivatedEmail(
  email: string,
  fullName: string,
  reason: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .reason-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tu cuenta ha sido desactivada</h1>
          </div>
          <div class="content">
            <p>Hola ${fullName},</p>

            <p>Te informamos que tu cuenta de cliente ha sido <strong>desactivada</strong>.</p>

            <div class="reason-box">
              <p><strong>Motivo:</strong></p>
              <p>${reason}</p>
            </div>

            <p>Durante este período:</p>
            <ul>
              <li>No podrás crear nuevas reservas de servicio</li>
              <li>No podrás acceder a tu cuenta</li>
              <li>Tus reservas activas pueden ser canceladas</li>
            </ul>

            <p>Si crees que esto es un error o deseas discutir esta decisión, por favor contacta a nuestro equipo de soporte.</p>

            <p>Email de soporte: admin@demo.com</p>

            <p>Saludos,<br>El equipo de CarWash Pro</p>
          </div>
          <div class="footer">
            <p>CarWash Pro - Plataforma de Servicios de Lavado</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Tu cuenta ha sido desactivada - CarWash Pro',
    html,
  });
}

/**
 * Send customer deleted email
 */
export async function sendCustomerDeletedEmail(
  email: string,
  fullName: string,
  reason: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .reason-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tu cuenta ha sido eliminada</h1>
          </div>
          <div class="content">
            <p>Hola ${fullName},</p>

            <p>Te informamos que tu cuenta en CarWash Pro ha sido <strong>permanentemente eliminada</strong>.</p>

            <div class="reason-box">
              <p><strong>Motivo:</strong></p>
              <p>${reason}</p>
            </div>

            <p>Todos tus datos han sido eliminados de nuestra plataforma de acuerdo con nuestras políticas de privacidad.</p>

            <p>Si tienes alguna pregunta o crees que esto es un error, por favor contacta a nuestro equipo de soporte lo antes posible.</p>

            <p>Email de soporte: admin@demo.com</p>

            <p>Saludos,<br>El equipo de CarWash Pro</p>
          </div>
          <div class="footer">
            <p>CarWash Pro - Plataforma de Servicios de Lavado</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Tu cuenta ha sido eliminada - CarWash Pro',
    html,
  });
}
