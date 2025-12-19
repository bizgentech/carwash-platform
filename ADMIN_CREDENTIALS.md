# Credenciales del Sistema CarWash Pro

## 🔐 Credenciales de Acceso

### Admin (Panel de Administración)
- **Email:** `admin@demo.com`
- **Password:** `demo123`
- **URL:** http://localhost:3001/admin/dashboard
- **Rol:** ADMIN

### Customer (Cliente)
- **Email:** `customer@demo.com`
- **Password:** `demo123`
- **URL:** http://localhost:3001/customer/dashboard
- **Rol:** CUSTOMER

### Washer (Lavador)
- **Email:** `washer@demo.com`
- **Password:** `demo123`
- **URL:** http://localhost:3001/washer/dashboard
- **Rol:** WASHER

### Washer 2 (Lavador Secundario)
- **Email:** `washer2@demo.com`
- **Password:** `demo123`
- **URL:** http://localhost:3001/washer/dashboard
- **Rol:** WASHER

---

## 👨‍💼 Panel de Admin - Funcionalidades

### Login
1. Ir a: http://localhost:3001/login
2. Ingresar: `admin@demo.com` / `demo123`
3. Click en "Login"
4. Automáticamente redirige a: `/admin/dashboard`

### Funcionalidades Disponibles

#### 📊 Overview (Tab Principal)
- Estadísticas generales de la plataforma
- Total de clientes, lavadores, reservas
- Comisión total generada (20%)
- Alertas de solicitudes pendientes

#### 👥 Pestaña "Clientes"
Gestión completa de clientes con las siguientes acciones:

**Ver información:**
- Nombre completo
- Email y teléfono
- Total de reservas realizadas
- Estado (Activo/Inactivo)
- Fecha de registro

**Acciones disponibles:**
1. **Desactivar Cliente** (icono amarillo)
   - Abre modal para escribir razón
   - Envía email al cliente con el motivo
   - Email de: `admin@demo.com`
   - Cliente no puede acceder a su cuenta

2. **Activar Cliente** (icono verde)
   - Reactiva cuenta desactivada
   - Cliente recupera acceso inmediatamente

3. **Eliminar Cliente** (icono rojo)
   - Abre modal para escribir razón
   - Envía email al cliente antes de eliminar
   - Elimina permanentemente (no se puede deshacer)
   - Elimina todos los datos relacionados

#### 🧼 Pestaña "Lavadores"
Gestión de lavadores aprobados:

**Ver información:**
- Nombre completo
- Email y teléfono
- Rating (estrellas)
- Total de trabajos completados
- Estado (Activo/Inactivo)
- Fecha de aprobación

**Acciones disponibles:**
1. **Desactivar Lavador** (icono amarillo)
   - Abre modal para escribir razón
   - Envía email al lavador con el motivo
   - No puede recibir nuevas solicitudes
   - Servicios activos pueden ser cancelados

2. **Reactivar Lavador** (icono verde)
   - Reactiva cuenta desactivada
   - Lavador puede recibir solicitudes nuevamente

#### 📝 Pestaña "Solicitudes" (Pending Applications)
Gestión de solicitudes de nuevos lavadores:

**Ver información completa:**
- Información personal (nombre, email, teléfono, dirección)
- Información del negocio (nombre, tipo, experiencia, descripción)
- Documentos subidos:
  - ID/Licencia (link para ver)
  - Prueba de seguro (link para ver)
  - Foto de vehículo (link para ver)
  - Logo del negocio (link para ver)
- Información de pago
- Referencias profesionales

**Acciones disponibles:**
1. **Aprobar Solicitud** (botón verde)
   - Abre modal de confirmación
   - Crea automáticamente cuenta de lavador
   - Genera contraseña temporal aleatoria
   - Envía email de bienvenida con credenciales
   - Email incluye:
     - Felicitaciones
     - Email del lavador
     - Contraseña temporal
     - Instrucciones para cambiar contraseña
     - Link al login
     - Información sobre comisiones (20/80)

2. **Rechazar Solicitud** (botón rojo)
   - Abre modal para escribir razón
   - Actualiza status a REJECTED
   - Envía email explicando el rechazo
   - Email incluye el motivo detallado
   - Invita a aplicar nuevamente si resuelve los problemas

#### 📋 Pestaña "Reservas" (All Bookings)
Ver todas las reservas del sistema:

**Información mostrada:**
- Nombre del servicio
- Cliente que solicitó
- Lavador asignado (si hay)
- Fecha y hora programada
- Monto total
- Estado actual (PENDING, ACCEPTED, COMPLETED, CANCELLED, etc.)

---

## 📧 Sistema de Emails

Todos los emails se envían desde: **admin@demo.com**

### Emails Automáticos Implementados:

#### 1. Cliente Desactivado
- **Trigger:** Admin desactiva un cliente
- **Destinatario:** Email del cliente
- **Contenido:**
  - Notificación de desactivación
  - Razón proporcionada por el admin
  - Consecuencias (no puede acceder, no puede crear reservas)
  - Email de soporte: admin@demo.com

#### 2. Cliente Eliminado
- **Trigger:** Admin elimina un cliente
- **Destinatario:** Email del cliente
- **Contenido:**
  - Notificación de eliminación permanente
  - Razón proporcionada por el admin
  - Aviso de eliminación de datos
  - Email de soporte: admin@demo.com

#### 3. Lavador Aprobado (Bienvenida)
- **Trigger:** Admin aprueba solicitud de lavador
- **Destinatario:** Email del solicitante
- **Contenido:**
  - Felicitaciones por la aprobación
  - Email de acceso
  - **Contraseña temporal** generada automáticamente
  - Instrucciones para primer login
  - Información sobre comisiones (80/20)
  - Link directo al login
  - Próximos pasos

#### 4. Lavador Rechazado
- **Trigger:** Admin rechaza solicitud de lavador
- **Destinatario:** Email del solicitante
- **Contenido:**
  - Notificación de rechazo
  - Razón proporcionada por el admin
  - Invitación a aplicar nuevamente si resuelve los problemas
  - Email de contacto para preguntas

#### 5. Lavador Desactivado
- **Trigger:** Admin desactiva un lavador
- **Destinatario:** Email del lavador
- **Contenido:**
  - Notificación de desactivación
  - Razón proporcionada por el admin
  - Consecuencias (no puede recibir solicitudes, no puede acceder)
  - Email de soporte: admin@demo.com

#### 6. Solicitud de Lavador Recibida (Confirmación)
- **Trigger:** Alguien envía formulario de registro de lavador
- **Destinatario:** Email del solicitante
- **Contenido:**
  - Confirmación de recepción
  - Próximos pasos
  - Tiempo estimado de revisión (24-48 horas)

#### 7. Notificación a Admin de Nueva Solicitud
- **Trigger:** Nueva solicitud de lavador
- **Destinatario:** admin@demo.com
- **Contenido:**
  - Resumen de la solicitud
  - Información del solicitante
  - Link directo a la solicitud en el panel

---

## 🔄 Flujo de Trabajo del Admin

### Aprobar un Lavador (Paso a Paso):

1. Login como admin (`admin@demo.com` / `demo123`)
2. Click en pestaña **"Solicitudes"**
3. Ver lista de solicitudes PENDING
4. Revisar información completa del solicitante
5. Click en los links de documentos para verificar:
   - ID/Licencia
   - Prueba de seguro
   - Fotos del vehículo o logo
6. Click en botón **"Aprobar"** (verde)
7. Confirmar en el modal que aparece
8. Sistema automáticamente:
   - Crea cuenta de lavador
   - Genera contraseña temporal (ej: "x4k9p2q1")
   - Cambia status de solicitud a APPROVED
   - Envía email de bienvenida al lavador
9. Lavador recibe email con credenciales
10. Lavador puede hacer login y cambiar su contraseña

### Rechazar un Lavador (Paso a Paso):

1. Login como admin
2. Click en pestaña **"Solicitudes"**
3. Click en botón **"Rechazar"** (rojo)
4. Escribir razón detallada en el modal
   - Ejemplo: "Documentos no son claros. El seguro está vencido."
5. Click en **"Rechazar"**
6. Sistema automáticamente:
   - Cambia status a REJECTED
   - Envía email al solicitante con la razón
7. Solicitante puede aplicar nuevamente después de resolver

### Desactivar un Cliente (Paso a Paso):

1. Login como admin
2. Click en pestaña **"Clientes"**
3. Buscar el cliente en la tabla
4. Click en icono amarillo (Desactivar)
5. Escribir razón en el modal
   - Ejemplo: "Múltiples cancelaciones sin aviso"
6. Click en **"Confirmar"**
7. Sistema envía email al cliente
8. Cliente ya no puede acceder a su cuenta

---

## 🚀 Para Iniciar el Sistema

### 1. Asegurar que la base de datos está corrida
```bash
# Si tienes datos previos y quieres empezar fresh:
npx prisma migrate reset

# O simplemente aplicar cambios:
npx prisma db push
npx prisma generate
```

### 2. Sembrar la base de datos con datos demo
```bash
npm run prisma:seed
```

Esto creará:
- 1 Admin (admin@demo.com)
- 1 Customer (customer@demo.com)
- 2 Washers (washer@demo.com, washer2@demo.com)
- 4 Services (Basic, Standard, Premium, Detailing)
- Vehículos, direcciones, reservas, reviews de ejemplo

### 3. Iniciar el servidor
```bash
npm run dev
```

### 4. Acceder al panel de admin
1. Abrir: http://localhost:3001/login
2. Ingresar: `admin@demo.com` / `demo123`
3. Explorar todas las funcionalidades

---

## 📝 Notas Importantes

### Emails (SendGrid)
- Si **NO** tienes SendGrid configurado:
  - Los emails se muestran en la **consola del servidor**
  - Verás el contenido completo en el terminal donde corre `npm run dev`
  - Incluye: destinatario, asunto, y cuerpo del mensaje

- Si **SÍ** tienes SendGrid configurado:
  - Agrega tu API key al `.env`:
    ```
    SENDGRID_API_KEY="SG.xxx"
    EMAIL_FROM="admin@demo.com"
    ```
  - Los emails se enviarán automáticamente

### Seguridad
- El admin solo puede acceder con `role: 'ADMIN'`
- Las contraseñas están hasheadas con bcrypt
- JWT tokens expiran en 30 días
- HttpOnly cookies para seguridad

### Base de Datos
- Usa PostgreSQL
- ORM: Prisma
- Modelo `WasherApplication` para solicitudes
- Modelo `User` para todos los usuarios (role-based)

---

## 🎯 Testing Checklist

### Como Admin, puedes probar:

- [ ] Login con admin@demo.com
- [ ] Ver estadísticas en Overview
- [ ] Ver lista de clientes
- [ ] Desactivar un cliente (ver email en consola)
- [ ] Reactivar un cliente
- [ ] Eliminar un cliente (ver email en consola)
- [ ] Ver lista de lavadores
- [ ] Desactivar un lavador (ver email en consola)
- [ ] Reactivar un lavador
- [ ] Ir a /washer/register y crear una solicitud
- [ ] Ver la solicitud en pestaña "Solicitudes"
- [ ] Revisar documentos de la solicitud
- [ ] Aprobar solicitud (ver email en consola con contraseña)
- [ ] Rechazar solicitud (ver email en consola con razón)
- [ ] Ver todas las reservas en pestaña "Reservas"
- [ ] Cerrar sesión
- [ ] Volver a iniciar sesión

---

## 🆘 Soporte

Para cualquier problema o pregunta:
- Email: admin@demo.com
- Revisar consola del servidor para ver emails simulados
- Revisar consola del navegador (F12) para errores de frontend

---

**Sistema creado y configurado por: Claude Code**
**Fecha: Enero 2025**
**Versión: 1.0**
