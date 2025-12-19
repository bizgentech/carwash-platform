# Sistema de Registro de Lavadores - Configuración

## Estado Actual

✅ **Sistema de Upload Local**: Los archivos se guardan en `/public/uploads/` en lugar de Cloudinary
✅ **Email Simulado**: Los emails se muestran en la consola del servidor si SendGrid no está configurado

## Configuración Actual (Sin servicios externos)

El sistema está configurado para funcionar **sin necesidad de Cloudinary o SendGrid**:

- **Archivos**: Se guardan localmente en `public/uploads/washer-applications/`
- **Emails**: Se muestran en la consola del servidor (terminal)

## Pasos para Probar el Sistema

### 1. Ejecutar la Migración de Base de Datos

```bash
npx prisma migrate dev --name add_washer_application
```

O si no quieres crear una migración:

```bash
npx prisma db push
```

### 2. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

### 3. Acceder al Formulario de Registro

Abre tu navegador en:
```
http://localhost:3001/washer/register
```

### 4. Completar el Formulario

El formulario tiene 6 pasos:

1. **Información Personal** (Todos los campos requeridos)
2. **Información del Negocio** (Tipo de servicio, experiencia, descripción)
3. **Documentos** (Subir ID, seguro, y foto de vehículo O logo)
4. **Información de Pago** (Seleccionar método y llenar datos)
5. **Referencias** (Opcional)
6. **Términos y Condiciones** (Aceptar términos)

### 5. Ver los Resultados

**Archivos Subidos:**
- Se guardan en: `public/uploads/washer-applications/`
- Subdirectorios: `id-documents/`, `insurance/`, `vehicles/`, `logos/`, `certificates/`

**Emails (en consola):**
- Revisa el terminal donde corre `npm run dev`
- Verás los emails que se "enviarían" al solicitante y al admin

**Base de Datos:**
- Abre Prisma Studio: `npx prisma studio`
- Ve a la tabla `WasherApplication`
- Verás el registro con status `PENDING`

## Estructura de Archivos Creados

```
src/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts              # API de upload (almacenamiento local)
│   │   └── washer/
│   │       └── register/
│   │           └── route.ts          # API de registro de lavadores
│   └── washer/
│       ├── register/
│       │   └── page.tsx              # Formulario multi-step
│       └── application-submitted/
│           └── page.tsx              # Página de confirmación
├── components/
│   └── washer/
│       └── FileUpload.tsx            # Componente de upload con preview
└── lib/
    ├── cloudinary.ts                 # Utilidad de Cloudinary (no usada por ahora)
    └── email.ts                      # Utilidad de email (simulado)

public/
└── uploads/
    └── washer-applications/
        ├── id-documents/
        ├── insurance/
        ├── vehicles/
        ├── logos/
        └── certificates/

prisma/
└── schema.prisma                     # Modelo WasherApplication agregado
```

## Configuración Opcional (Para Producción)

Si quieres habilitar los servicios externos más adelante:

### Cloudinary (Para almacenamiento en la nube)

Agrega a tu `.env`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

Luego modifica `/src/app/api/upload/route.ts` para usar Cloudinary en lugar del almacenamiento local.

### SendGrid (Para envío de emails reales)

Agrega a tu `.env`:
```env
SENDGRID_API_KEY="tu-sendgrid-api-key"
EMAIL_FROM="noreply@tudominio.com"
ADMIN_EMAIL="admin@tudominio.com"
```

El sistema detectará automáticamente la clave y enviará emails reales.

## Solución de Problemas

### Error: "Failed to upload file"

**Verificar:**
1. Que el directorio `public/uploads/` existe
2. Que tienes permisos de escritura
3. Que el archivo no supera 10MB
4. Que el formato es permitido (JPG, PNG, GIF, WEBP, PDF, DOC, DOCX)

**Revisar consola del navegador (F12):**
- Ve a la pestaña "Network"
- Busca la llamada a `/api/upload`
- Revisa la respuesta para ver el error específico

**Revisar consola del servidor:**
- Revisa el terminal donde corre `npm run dev`
- Busca mensajes de error de "Upload error"

### Error: "Prisma Client not found"

```bash
npx prisma generate
```

### Uploads no se muestran en el formulario

Verifica que el servidor esté sirviendo archivos estáticos desde `/public/uploads/`:
1. Sube un archivo de prueba
2. Intenta acceder a: `http://localhost:3001/uploads/washer-applications/id-documents/[nombre-archivo]`

## Pruebas

### Probar Upload Directamente

Puedes probar el endpoint de upload con curl:

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/ruta/a/tu/imagen.jpg" \
  -F "folder=washer-applications/id-documents"
```

### Ver Solicitudes en la Base de Datos

```bash
npx prisma studio
```

Luego navega a `WasherApplication` para ver todas las solicitudes.

## Próximos Pasos

1. ✅ Sistema de registro funcionando
2. 🔲 Vista de administrador para revisar solicitudes
3. 🔲 Sistema de aprobación/rechazo
4. 🔲 Notificaciones al aprobar/rechazar
5. 🔲 Creación automática de cuenta de lavador al aprobar
6. 🔲 Integración con Stripe Connect para pagos

## Notas de Seguridad

- ⚠️ Los archivos se guardan localmente. Para producción, usa Cloudinary o S3
- ⚠️ Los archivos en `public/uploads/` son accesibles públicamente
- ⚠️ Implementa autenticación en la vista de admin antes de producción
- ⚠️ Los datos bancarios se guardan en texto plano. Considera encriptación para producción
