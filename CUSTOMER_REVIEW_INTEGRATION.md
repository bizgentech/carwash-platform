# Integración del Sistema de Calificación en Customer Dashboard

## ✅ INTEGRACIÓN COMPLETADA

El sistema de calificación ha sido completamente integrado en el Customer Dashboard.

---

## 📋 Cambios Realizados

### 1. **Customer Dashboard** (`src/app/customer/dashboard/page.tsx`)

#### Importaciones Agregadas:
```typescript
import ReviewModal from '@/components/modals/ReviewModal'
```

#### Tipos Actualizados:
```typescript
interface Booking {
  // ... campos existentes
  washer?: {
    id: string
    name: string
    rating: number
    profileImage?: string  // Agregado para ReviewModal
  }
  review?: {               // NUEVO: para verificar si ya existe review
    id: string
    rating: number
    comment: string | null
    createdAt: string
  }
}
```

#### Estado Modificado:
```typescript
// ANTES (modal simple):
const [ratingBookingId, setRatingBookingId] = useState<string | null>(null)
const [rating, setRating] = useState(0)
const [ratingComment, setRatingComment] = useState('')

// DESPUÉS (ReviewModal integrado):
const [reviewModal, setReviewModal] = useState<{
  isOpen: boolean
  booking: Booking | null
}>({
  isOpen: false,
  booking: null,
})
```

#### Función Eliminada:
- ❌ `handleSubmitRating()` - Ya no es necesaria, ReviewModal lo maneja

#### UI Actualizada en "My Bookings":

**Botón de Calificación:**
```typescript
{/* Solo mostrar si está COMPLETED, tiene washer Y NO tiene review */}
{booking.status === 'COMPLETED' && booking.washer && !booking.review && (
  <button
    onClick={() => setReviewModal({ isOpen: true, booking })}
    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium w-full"
  >
    ⭐ Calificar Servicio
  </button>
)}
```

**Mostrar Review Existente:**
```typescript
{/* Mostrar review si ya existe */}
{booking.review && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
    <p className="text-sm font-medium text-gray-900 mb-1">Tu Calificación</p>
    <div className="flex items-center gap-1 mb-1">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-lg ${i < booking.review!.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
          ⭐
        </span>
      ))}
    </div>
    {booking.review.comment && (
      <p className="text-xs text-gray-600 italic">"{booking.review.comment}"</p>
    )}
  </div>
)}
```

**ReviewModal Renderizado:**
```typescript
{/* Review Modal al final del componente */}
{reviewModal.booking && reviewModal.booking.washer && (
  <ReviewModal
    isOpen={reviewModal.isOpen}
    onClose={() => setReviewModal({ isOpen: false, booking: null })}
    booking={{
      id: reviewModal.booking.id,
      washer: {
        name: reviewModal.booking.washer.name,
        profileImage: reviewModal.booking.washer.profileImage,
      },
      service: {
        name: reviewModal.booking.service.name,
      },
    }}
    customerId={user?.id || ''}
    onReviewSubmitted={() => {
      fetchBookings() // Actualiza la lista automáticamente
    }}
  />
)}
```

---

### 2. **Nuevo API Endpoint** (`src/app/api/bookings/customer/route.ts`)

**Creado:** Endpoint para obtener bookings del customer con reviews.

**Endpoint:** `GET /api/bookings/customer`

**Características:**
- Requiere autenticación (Bearer token)
- Incluye relación con `review` para verificar si existe
- Incluye información completa del `washer` con `profileImage`
- Ordenado por `scheduledFor` descendente

**Response:**
```json
{
  "bookings": [
    {
      "id": "xxx",
      "status": "COMPLETED",
      "scheduledFor": "2025-01-15T10:00:00",
      "completedAt": "2025-01-15T11:30:00",
      "totalAmount": 50.00,
      "customerNotes": "...",
      "service": {
        "name": "Premium Wash",
        "basePrice": 50.00
      },
      "vehicle": {
        "make": "Toyota",
        "model": "Camry"
      },
      "washer": {
        "id": "washer123",
        "name": "Juan Pérez",
        "rating": 4.8,
        "profileImage": "/uploads/..."
      },
      "review": {
        "id": "review123",
        "rating": 5,
        "comment": "Excelente servicio",
        "createdAt": "2025-01-15T12:00:00"
      }
    }
  ]
}
```

---

## 🎯 Flujo de Usuario

### Cliente quiere calificar un servicio:

1. **Ve a "My Bookings"**
   - Lista de todas sus reservas

2. **Identifica servicio completado**
   - Status: COMPLETED
   - Si NO tiene review → Botón "⭐ Calificar Servicio"
   - Si YA tiene review → Muestra su calificación

3. **Click en "Calificar Servicio"**
   - Se abre ReviewModal
   - Muestra foto/inicial del washer
   - Muestra nombre del servicio

4. **Selecciona estrellas (1-5)**
   - Interactivo con hover
   - Texto descriptivo (Malo, Regular, Bueno, etc.)

5. **Escribe comentario (opcional)**
   - Máximo 500 caracteres
   - Contador de caracteres

6. **Click en "Enviar Reseña"**
   - Valida que hay al menos 1 estrella
   - Envía a `/api/reviews`
   - Actualiza rating del washer automáticamente
   - Crea notificación para el washer

7. **Confirmación**
   - Toast: "¡Reseña enviada exitosamente!"
   - Modal se cierra
   - Lista se actualiza automáticamente
   - Ahora muestra la review en lugar del botón

---

## 🔄 Actualización Automática del Rating del Washer

Cuando se envía una review (`POST /api/reviews`):

1. **Crea el review**
   ```typescript
   await prisma.review.create({
     data: {
       bookingId,
       reviewerId,
       reviewedId: washerId,
       rating,
       comment,
     },
   })
   ```

2. **Actualiza rating del washer automáticamente**
   ```typescript
   // Obtiene todas las reviews del washer
   const reviews = await prisma.review.findMany({
     where: { reviewedId: washerId },
   })

   // Calcula promedio
   const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

   // Actualiza washer
   await prisma.user.update({
     where: { id: washerId },
     data: {
       rating: averageRating,
       totalReviews: reviews.length,
     },
   })
   ```

3. **Crea notificación**
   ```typescript
   await prisma.notification.create({
     data: {
       userId: washerId,
       bookingId,
       title: 'Nueva Reseña Recibida',
       message: `Recibiste una calificación de ${rating} estrellas`,
       type: 'REVIEW',
     },
   })
   ```

---

## ✨ Características Implementadas

### ✅ Botón "Calificar Servicio"
- Solo aparece en bookings COMPLETED con washer asignado
- Solo si NO existe review previa
- Diseño atractivo con emoji ⭐

### ✅ ReviewModal
- Modal profesional y atractivo
- Sistema de estrellas interactivo
- Campo de comentario opcional
- Validación (requiere al menos 1 estrella)
- Loading states
- Error handling

### ✅ Mostrar Review Existente
- Box amarillo con la calificación dada
- Estrellas visuales (llenas/vacías)
- Comentario si existe
- No permite calificar dos veces

### ✅ Actualización Automática
- Después de calificar, la lista se recarga
- El botón desaparece
- Aparece la review enviada

### ✅ API Completa
- Endpoint para listar bookings con reviews
- Endpoint para crear reviews
- Actualización automática de ratings
- Notificaciones para washers

---

## 🎨 Ejemplo Visual del Flujo

```
┌─────────────────────────────────────────┐
│  My Bookings                            │
├─────────────────────────────────────────┤
│                                         │
│  📋 Booking #1234                       │
│  ✅ COMPLETED                           │
│  Premium Wash - 2025-01-15             │
│  Toyota Camry                           │
│  Washer: Juan Pérez (4.8 ⭐)           │
│                                         │
│  ┌──────────────────────────┐          │
│  │ ⭐ Calificar Servicio    │  ← Click │
│  └──────────────────────────┘          │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Calificar Servicio              ✕      │
├─────────────────────────────────────────┤
│  👤 Juan Pérez                          │
│  Premium Wash                           │
│                                         │
│  ¿Cómo fue tu experiencia?             │
│  ⭐ ⭐ ⭐ ⭐ ⭐                          │
│  Excelente                              │
│                                         │
│  Comentario (opcional)                  │
│  ┌───────────────────────────────────┐ │
│  │ El servicio fue excelente...      │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│  450/500                                │
│                                         │
│  ┌─────────┐  ┌────────────────────┐  │
│  │ Cancelar│  │ Enviar Reseña     │  │
│  └─────────┘  └────────────────────┘  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  ✅ ¡Reseña enviada exitosamente!      │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  My Bookings                            │
├─────────────────────────────────────────┤
│                                         │
│  📋 Booking #1234                       │
│  ✅ COMPLETED                           │
│  Premium Wash - 2025-01-15             │
│  Toyota Camry                           │
│  Washer: Juan Pérez (4.8 ⭐)           │
│                                         │
│  ┌──────────────────────────┐          │
│  │ Tu Calificación           │          │
│  │ ⭐⭐⭐⭐⭐                 │          │
│  │ "El servicio fue..."      │          │
│  └──────────────────────────┘          │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing

### Para probar la integración:

1. **Login como Customer**
   ```
   Email: customer@demo.com
   Password: demo123
   ```

2. **Ir a "My Bookings"**
   - Verás la lista de tus bookings

3. **Completar un booking** (como admin o washer)
   - Cambiar status a COMPLETED en la base de datos o desde admin dashboard

4. **Volver a "My Bookings" como Customer**
   - Debería aparecer botón "⭐ Calificar Servicio"

5. **Click en "Calificar Servicio"**
   - Modal se abre
   - Selecciona estrellas
   - Escribe comentario
   - Click "Enviar Reseña"

6. **Verificar**
   - Toast de éxito
   - Modal se cierra
   - Lista se actualiza
   - Ahora muestra la review en lugar del botón

7. **Verificar en DB**
   - Review creado en tabla `Review`
   - Rating del washer actualizado en tabla `User`
   - Notificación creada en tabla `Notification`

---

## 📊 Base de Datos

### Tablas Involucradas:

**Review:**
```sql
id          STRING   (PK)
bookingId   STRING   (FK → Booking, UNIQUE)
reviewerId  STRING   (FK → User - Customer)
reviewedId  STRING   (FK → User - Washer)
rating      INT      (1-5)
comment     STRING?  (Opcional)
createdAt   DATETIME
```

**User (Washer):**
```sql
rating       FLOAT  (Promedio calculado)
totalReviews INT    (Contador de reviews)
```

**Notification:**
```sql
userId    STRING   (FK → User - Washer)
bookingId STRING?  (FK → Booking)
title     STRING   ("Nueva Reseña Recibida")
message   STRING   ("Recibiste una calificación de X estrellas")
type      STRING   ("REVIEW")
isRead    BOOLEAN  (default: false)
```

---

## 🎉 ¡SISTEMA COMPLETO Y FUNCIONAL!

El sistema de calificación está completamente integrado y listo para usar. Los clientes pueden:

- ✅ Ver sus bookings completados
- ✅ Calificar servicios completados (una vez)
- ✅ Ver sus calificaciones previas
- ✅ Escribir comentarios opcionales
- ✅ El rating del washer se actualiza automáticamente
- ✅ El washer recibe notificación de la nueva review

**Todo funciona sin necesidad de cambios adicionales.** 🚀
