# Sistema de Calificación y Asignación Inteligente

## Resumen de Implementación

Este documento describe el sistema completo de calificación y matching inteligente de lavadores implementado en la plataforma CarWash.

---

## 1. SISTEMA DE RATING

### A. Modelo de Datos (Schema)

**Campos agregados/actualizados en `User` model:**
```prisma
// Washer fields
rating            Float     @default(0)      // Promedio 0-5
totalJobs         Int       @default(0)      // Total de trabajos
totalReviews      Int       @default(0)      // Total de reviews
```

**Modelo `Review` (ya existía, sin cambios necesarios):**
```prisma
model Review {
  id         String   @id @default(cuid())
  bookingId  String   @unique
  reviewerId String   // Cliente que califica
  reviewedId String   // Lavador calificado
  rating     Int      // 1-5 estrellas
  comment    String?  // Comentario opcional
  createdAt  DateTime @default(now())
}
```

### B. API de Reviews

**Endpoint:** `POST /api/reviews`
- Crea una review para un booking completado
- Valida que el booking esté completado
- Valida que no exista review previa
- Actualiza automáticamente el rating promedio del washer
- Crea notificación para el washer

**Actualización Automática del Rating:**
- Calcula promedio de todas las reviews del washer
- Actualiza campos `rating` y `totalReviews`

### C. UI para Calificar

**Componente:** `src/components/modals/ReviewModal.tsx`

Características:
- Sistema de estrellas interactivo (1-5)
- Campo de comentario opcional (max 500 caracteres)
- Validación: requiere al menos 1 estrella
- Integrado con API de reviews
- Notificaciones de éxito/error

**Integración en Customer Dashboard:**
- Mostrar botón "Calificar" en servicios COMPLETED sin review
- Abrir ReviewModal al hacer click
- Actualizar lista después de enviar review

---

## 2. ZONAS DE COBERTURA POR LAVADOR

### Campos Agregados al Schema

```prisma
// User model - Washer fields
serviceRadius      Int       @default(10)     // Radio en km
preferredAreas     String[]  @default([])     // Zonas preferidas
latitude           Float?                      // Ubicación actual
longitude          Float?                      // Ubicación actual
lastLocationUpdate DateTime?                   // Última actualización
```

### API de Cobertura

**Endpoint:** `PATCH /api/washer/coverage`
- Actualiza `serviceRadius` (1-100 km)
- Actualiza `preferredAreas` (array de strings)
- Validaciones de rango

**Endpoint:** `GET /api/washer/coverage?washerId=xxx`
- Obtiene configuración actual de cobertura

### UI de Configuración

**Componente:** `src/components/washer/CoverageSettings.tsx`

Características:
- Slider para radio de servicio (1-50 km)
- Input para agregar zonas preferidas
- Tags removibles para zonas agregadas
- Botón para actualizar ubicación con geolocalización
- Indicadores de estado (ubicación activa/inactiva)

---

## 3. UBICACIÓN EN TIEMPO REAL

### API de Ubicación

**Endpoint:** `PATCH /api/washer/location`

Actualiza:
- `latitude` y `longitude` (validados -90/90, -180/180)
- `lastLocationUpdate` (timestamp automático)
- `isAvailable` (opcional, para activar/desactivar disponibilidad)

**Endpoint:** `GET /api/washer/location?washerId=xxx`
- Obtiene ubicación actual del washer

### Integración con UI

El componente `CoverageSettings` incluye:
- Botón "Actualizar Ubicación Ahora"
- Usa API de geolocalización del navegador
- Solicita permisos de ubicación al usuario
- Actualiza automáticamente la ubicación en BD

**Recomendación para producción:**
- Implementar actualización automática cada 5 minutos mientras `isAvailable = true`
- Usar timer en cliente o WebSocket para actualizaciones en tiempo real

---

## 4. ALGORITMO DE MATCHING INTELIGENTE

### Utilidad Haversine

**Archivo:** `src/lib/haversine.ts`

**Funciones principales:**
1. `calculateDistance(coord1, coord2): number`
   - Fórmula de Haversine
   - Retorna distancia en km

2. `isWithinRadius(center, point, radiusKm): boolean`
   - Verifica si un punto está dentro del radio

3. `calculateMatchScore(rating, distanceKm): number`
   - Score = (rating * 0.7) + (proximidad * 0.3)
   - Rating normalizado: 0-1 (5 estrellas = 1.0)
   - Proximidad normalizada: 0-1 (más cerca = 1.0)
   - Retorna score entre 0 y 1

4. `sortWashersByScore(washers): WasherWithDistance[]`
   - Ordena lavadores por score descendente

### API de Matching

**Endpoint:** `POST /api/bookings/match-washers`

**Request:**
```json
{
  "latitude": 19.4326,
  "longitude": -99.1332,
  "limit": 5
}
```

**Proceso:**
1. **Filtrar washers:**
   - `role = WASHER`
   - `isApproved = true`
   - `isAvailable = true`
   - `isActive = true`
   - `latitude` y `longitude` no nulos

2. **Calcular distancia:**
   - Usa fórmula Haversine
   - Filtra por `serviceRadius` del washer

3. **Calcular score:**
   - 70% rating (normalizado 0-1)
   - 30% proximidad (normalizado 0-1)

4. **Ordenar y limitar:**
   - Ordena por score descendente
   - Retorna top N washers (default: 5)

**Response:**
```json
{
  "washers": [
    {
      "id": "xxx",
      "name": "Juan Pérez",
      "rating": 4.8,
      "totalJobs": 156,
      "totalReviews": 142,
      "distanceKm": 2.3,
      "score": 0.91,
      "isBestMatch": true,
      "rank": 1,
      "recentReviews": [...]
    }
  ],
  "total": 12,
  "showing": 5,
  "serviceLocation": {
    "latitude": 19.4326,
    "longitude": -99.1332
  }
}
```

### UI de Selección de Lavador

**Componente:** `src/components/booking/WasherSelector.tsx`

Características:
- Lista de lavadores ordenados por match score
- Badge "Mejor Match" para el primero
- Barra de progreso visual del % de match
- Información: rating, distancia, trabajos totales
- Reviews recientes expandibles
- Selección con radio button
- Auto-selección del mejor match por defecto

**Props:**
```typescript
{
  latitude: number;
  longitude: number;
  onSelect: (washerId: string) => void;
  selectedWasherId?: string;
}
```

---

## 5. FLUJO COMPLETO DE USO

### Para el Cliente (Customer):

1. **Crear una reserva:**
   - Selecciona servicio
   - Selecciona ubicación (address con lat/long)
   - Sistema llama a `/api/bookings/match-washers`
   - Muestra `WasherSelector` con lavadores sugeridos
   - Cliente elige lavador (o acepta sugerencia)
   - Crea booking con `washerId` seleccionado

2. **Después del servicio:**
   - En "My Bookings", servicios COMPLETED muestran botón "Calificar"
   - Click abre `ReviewModal`
   - Selecciona estrellas y escribe comentario
   - Submit actualiza rating del washer automáticamente

### Para el Lavador (Washer):

1. **Configurar área de cobertura:**
   - Va a su dashboard
   - Renderiza `CoverageSettings` component
   - Actualiza ubicación con geolocalización
   - Configura radio de servicio (ej: 15 km)
   - Agrega zonas preferidas (opcional)
   - Guarda configuración

2. **Activar disponibilidad:**
   - Toggle `isAvailable = true`
   - Opcionalmente actualiza ubicación en tiempo real
   - Ahora aparece en resultados de matching

3. **Recibir notificación:**
   - Cuando cliente crea booking, washer recibe notificación
   - Puede aceptar o rechazar
   - Si rechaza, sistema puede ofrecer al siguiente en ranking

---

## 6. ARCHIVOS CREADOS/MODIFICADOS

### Schema de Base de Datos:
- ✅ `prisma/schema.prisma` - Agregados campos: `serviceRadius`, `preferredAreas`, `latitude`, `longitude`, `lastLocationUpdate`, `totalReviews`, `address`

### Utilidades:
- ✅ `src/lib/haversine.ts` - Cálculos de distancia y scoring

### APIs:
- ✅ `src/app/api/reviews/route.ts` - POST: crear review
- ✅ `src/app/api/washer/coverage/route.ts` - GET/PATCH: configuración de cobertura
- ✅ `src/app/api/washer/location/route.ts` - GET/PATCH: ubicación en tiempo real
- ✅ `src/app/api/bookings/match-washers/route.ts` - POST: matching inteligente

### Componentes:
- ✅ `src/components/modals/ReviewModal.tsx` - Modal de calificación
- ✅ `src/components/booking/WasherSelector.tsx` - Selector de lavadores con matching
- ✅ `src/components/washer/CoverageSettings.tsx` - Configuración de área de cobertura

---

## 7. PRÓXIMOS PASOS PARA INTEGRACIÓN

### En Customer Dashboard (`/customer/dashboard`):

1. Agregar botón "Calificar" en bookings completados sin review:
```tsx
import ReviewModal from '@/components/modals/ReviewModal';

{booking.status === 'COMPLETED' && !booking.review && (
  <button onClick={() => setReviewModal({ isOpen: true, booking })}>
    Calificar Servicio
  </button>
)}

<ReviewModal
  isOpen={reviewModal.isOpen}
  onClose={() => setReviewModal({ isOpen: false, booking: null })}
  booking={reviewModal.booking}
  customerId={user.id}
  onReviewSubmitted={() => {
    fetchBookings(); // Recargar lista
  }}
/>
```

### En Booking Creation Flow:

1. Después de seleccionar servicio y dirección:
```tsx
import WasherSelector from '@/components/booking/WasherSelector';

<WasherSelector
  latitude={selectedAddress.latitude}
  longitude={selectedAddress.longitude}
  onSelect={(washerId) => setSelectedWasherId(washerId)}
  selectedWasherId={selectedWasherId}
/>
```

### En Washer Dashboard (`/washer/dashboard`):

1. Agregar pestaña o sección de configuración:
```tsx
import CoverageSettings from '@/components/washer/CoverageSettings';

<CoverageSettings washerId={user.id} />
```

---

## 8. TESTING

### Probar Sistema de Rating:

1. Crear booking y completarlo
2. Como customer, ir a "My Bookings"
3. Click en "Calificar"
4. Dar estrellas y comentario
5. Verificar que rating del washer se actualice

### Probar Matching:

1. Como washer, configurar ubicación y radio
2. Como customer, crear booking
3. Verificar que aparezcan lavadores cercanos
4. Verificar orden por score
5. Verificar badge "Mejor Match" en el primero

### Probar Cobertura:

1. Como washer, ir a settings
2. Actualizar ubicación (permitir geolocalización)
3. Cambiar radio de servicio
4. Agregar zonas preferidas
5. Guardar y verificar cambios

---

## 9. CONSIDERACIONES DE PRODUCCIÓN

### Seguridad:
- ✅ Validación de coordenadas (lat/long en rangos válidos)
- ✅ Validación de rating (1-5)
- ✅ Verificación de permisos (solo customer puede calificar su booking)
- ⚠️ Agregar autenticación JWT a todas las rutas

### Performance:
- ⚠️ Considerar caché para resultados de matching
- ⚠️ Índices en BD para `latitude`, `longitude`, `isAvailable`
- ⚠️ Pagination para lista de washers si hay muchos

### UX:
- ✅ Loading states en todos los componentes
- ✅ Error handling con mensajes claros
- ✅ Geolocalización con permisos
- ⚠️ Agregar mapas visuales (Google Maps/Mapbox) en futuro

### Tiempo Real:
- ⚠️ Implementar WebSocket para actualización automática de ubicación
- ⚠️ Timer para actualizar ubicación cada 5 min cuando isAvailable=true
- ⚠️ Notificaciones push para nuevos bookings

---

## 10. FÓRMULAS Y ALGORITMOS

### Haversine Distance Formula:

```
a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
c = 2 * atan2(√a, √(1-a))
d = R * c
```

Donde:
- R = 6371 km (radio de la Tierra)
- Δlat = lat2 - lat1
- Δlon = lon2 - lon1
- Retorna distancia en km

### Match Score Formula:

```
normalizedRating = rating / 5
normalizedProximity = max(0, 1 - (distance / maxDistance))
score = (normalizedRating * 0.7) + (normalizedProximity * 0.3)
```

Pesos:
- Rating: 70% (calidad del servicio)
- Proximidad: 30% (cercanía)

---

## ✅ SISTEMA COMPLETO IMPLEMENTADO

Todas las funcionalidades solicitadas están implementadas y listas para integración:

1. ✅ Sistema de Rating con actualización automática
2. ✅ Zonas de Cobertura configurables
3. ✅ Ubicación en Tiempo Real
4. ✅ Matching Inteligente con algoritmo Haversine
5. ✅ UI completa (ReviewModal, WasherSelector, CoverageSettings)
6. ✅ APIs robustas con validaciones

**Solo falta integrar los componentes en los dashboards correspondientes siguiendo las instrucciones de la sección 7.**
