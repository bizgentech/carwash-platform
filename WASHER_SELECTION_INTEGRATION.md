# 🚀 Integración del WasherSelector en el Proceso de Booking

## ✅ INTEGRACIÓN COMPLETADA

El sistema de selección de lavadores ha sido completamente integrado en el flujo de booking del Customer Dashboard con 3 opciones de selección.

---

## 📋 Resumen de Cambios

### 1. **Nuevos API Endpoints**

#### `/api/bookings/washer-preview` (POST)
- **Propósito:** Obtener preview del lavador que sería asignado automáticamente
- **Input:** `{ latitude, longitude }`
- **Output:** Top 1 washer basado en score (rating + proximidad)
- **Uso:** Mostrar preview en modo "Asignación Automática"

#### `/api/bookings/favorite-washers` (POST)
- **Propósito:** Obtener lavadores favoritos del cliente
- **Input:** `{ latitude, longitude }` + Bearer token
- **Filtros:**
  - Bookings COMPLETED con el cliente
  - Rating dado >= 4 estrellas
  - Washer actualmente disponible y dentro del área
- **Output:** Lista ordenada por rating dado y número de servicios previos
- **Incluye:**
  - `yourAverageRating` - Promedio de ratings que el cliente le dio
  - `servicesWithYou` - Número de servicios previos
  - `lastService` - Último servicio realizado (fecha, nombre, rating)

#### `/api/bookings` (POST)
- **Propósito:** Crear nuevo booking con asignación de washer
- **Input:**
```json
{
  "serviceId": "xxx",
  "vehicleId": "xxx",
  "scheduledFor": "2025-01-20T10:00:00",
  "address": "123 Main St, SF, CA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "notes": "...",
  "washerId": "xxx" | null,
  "washerSelectionMode": "automatic" | "manual" | "favorites"
}
```
- **Lógica:**
  - Si `washerSelectionMode === 'automatic'`: Ejecuta algoritmo de matching y asigna el mejor
  - Si `manual` o `favorites`: Usa el `washerId` proporcionado
  - Valida que el washer esté disponible y aprobado
  - Crea notificación para el washer asignado

---

### 2. **Nuevo Componente: WasherSelectionStep**

**Ubicación:** `src/components/booking/WasherSelectionStep.tsx`

**Características:**

#### **Opción 1: ⚡ Asignación Automática (Recomendado)**
- Seleccionada por defecto
- Carga preview del mejor washer automáticamente
- Muestra:
  - Foto/inicial del washer
  - Nombre
  - Rating (X.X ⭐) + total de reviews
  - Distancia (X.X km)
  - Badge "Mejor Match"
- Texto explicativo: "Dejar que el sistema elija el mejor lavador disponible"

```tsx
{mode === 'automatic' && washerPreview && (
  <div className="preview-card">
    <img src={washerPreview.profileImage} />
    <div>
      <p>{washerPreview.name}</p>
      <p>⭐ {washerPreview.rating} ({washerPreview.totalReviews})</p>
      <p>📍 {washerPreview.distanceKm} km</p>
    </div>
    <div className="badge">Mejor Match</div>
  </div>
)}
```

#### **Opción 2: 📋 Elegir Manualmente**
- Muestra WasherSelector con top 5-10 lavadores
- Ordenados por score (70% rating + 30% proximidad)
- Cards seleccionables con:
  - Foto/inicial
  - Nombre
  - Rating general
  - Distancia
  - Trabajos completados
  - Barra de "match score"
  - Reviews recientes (expandible)
- Radio button para selección

#### **Opción 3: ⭐ Elegir de Mis Favoritos**
- Muestra lavadores que ya han dado servicio con rating >= 4
- Ordenados por: rating dado (desc) → servicios previos (desc)
- Cards especiales con:
  - Foto/inicial
  - Nombre
  - **Tu calificación:** X.X ⭐ (promedio dado por el cliente)
  - **Servicios previos:** X servicios
  - **Distancia actual:** X.X km
  - **Rating general:** X.X ⭐
  - **Último servicio:**
    - Nombre del servicio
    - Fecha
    - Rating dado
- Si no hay favoritos disponibles:
  - Mensaje: "No tienes lavadores favoritos disponibles en este momento"
  - Explicación: "Los favoritos son lavadores que te han dado servicio con calificación de 4+ estrellas"

**Props del componente:**
```tsx
interface WasherSelectionStepProps {
  address: {
    latitude: number;
    longitude: number;
  };
  onWasherSelected: (washerId: string | null, mode: SelectionMode) => void;
  selectedWasherId?: string | null;
}
```

**Estados internos:**
```tsx
const [mode, setMode] = useState<'automatic' | 'manual' | 'favorites'>('automatic');
const [washerPreview, setWasherPreview] = useState<WasherPreview | null>(null);
const [favoriteWashers, setFavoriteWashers] = useState<FavoriteWasher[]>([]);
const [selectedFavoriteId, setSelectedFavoriteId] = useState<string | null>(null);
```

---

### 3. **Modificación del WasherSelector**

**Actualización:** `src/components/booking/WasherSelector.tsx`

**Cambios:**
- Soporte para props en dos formatos:
  ```tsx
  // Formato original
  <WasherSelector latitude={37.7} longitude={-122.4} onSelect={...} />

  // Formato nuevo (compatible con WasherSelectionStep)
  <WasherSelector address={{ latitude: 37.7, longitude: -122.4 }} onWasherSelected={...} />
  ```
- Props opcionales para mayor flexibilidad
- Compatibilidad hacia atrás mantenida

---

### 4. **Integración en Customer Dashboard**

**Archivo modificado:** `src/app/customer/dashboard/page.tsx`

#### **Imports agregados:**
```tsx
import WasherSelectionStep from '@/components/booking/WasherSelectionStep'
```

#### **Estados agregados:**
```tsx
const [selectedWasher, setSelectedWasher] = useState<string | null>(null)
const [washerSelectionMode, setWasherSelectionMode] = useState<'automatic' | 'manual' | 'favorites'>('automatic')
const [addressCoordinates, setAddressCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
```

#### **Geocoding automático en campo de dirección:**
```tsx
<input
  type="text"
  value={address}
  onChange={(e) => {
    setAddress(e.target.value);
    setAddressCoordinates(null); // Reset coordinates
  }}
  onBlur={async () => {
    // Geocode address using Nominatim (OpenStreetMap)
    if (address.trim()) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data[0]) {
        setAddressCoordinates({
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        });
      }
    }
  }}
/>
```

**Feedback visual:**
```tsx
{addressCoordinates && (
  <p className="text-sm text-green-600">✓ Ubicación confirmada</p>
)}
```

#### **Nuevo Paso 5: Seleccionar Lavador**
```tsx
{/* Solo se muestra si la dirección tiene coordenadas */}
{addressCoordinates && (
  <div>
    <label className="block text-lg font-semibold text-gray-900 mb-4">
      5. Seleccionar Lavador
    </label>
    <WasherSelectionStep
      address={addressCoordinates}
      onWasherSelected={(washerId, mode) => {
        setSelectedWasher(washerId);
        setWasherSelectionMode(mode);
      }}
      selectedWasherId={selectedWasher}
    />
  </div>
)}
```

#### **Validación actualizada en handleBooking:**
```tsx
const handleBooking = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validaciones básicas
  if (!selectedService || !selectedVehicle || !selectedDate || !selectedTime || !address) {
    toast.error('Please fill all required fields')
    return
  }

  // Validar que la dirección haya sido geocodificada
  if (!addressCoordinates) {
    toast.error('Please wait for address to be validated')
    return
  }

  // Validar selección de washer para modos manual y favoritos
  if (washerSelectionMode !== 'automatic' && !selectedWasher) {
    toast.error('Please select a washer')
    return
  }

  // Crear booking
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      serviceId: selectedService,
      vehicleId: selectedVehicle,
      scheduledFor: `${selectedDate}T${selectedTime}:00`,
      address,
      latitude: addressCoordinates.latitude,
      longitude: addressCoordinates.longitude,
      notes,
      washerId: selectedWasher, // null para modo automático
      washerSelectionMode,
    }),
  })
}
```

#### **Reset de formulario actualizado:**
```tsx
// Reset form
setSelectedService('')
setSelectedVehicle('')
setSelectedDate('')
setSelectedTime('')
setAddress('')
setNotes('')
setSelectedWasher(null)
setWasherSelectionMode('automatic')
setAddressCoordinates(null)
```

---

## 🔄 Flujo Completo del Usuario

### Proceso de Booking Paso a Paso:

```
1. Cliente ingresa al dashboard
   ↓
2. Click en "+ New Booking"
   ↓
3. PASO 1: Selecciona servicio (Standard, Premium, etc.)
   ↓
4. PASO 2: Selecciona vehículo
   ↓
5. PASO 3: Selecciona fecha y hora
   ↓
6. PASO 4: Ingresa dirección del servicio
   ↓
   - Al terminar de escribir (onBlur), se geocodifica automáticamente
   - Muestra "✓ Ubicación confirmada"
   ↓
7. PASO 5: Seleccionar Lavador (AHORA DISPONIBLE)
   ↓
   Opción A: Asignación Automática ⚡ (DEFAULT)
   ├─ Ve preview del mejor washer
   ├─ Nombre, rating, distancia
   └─ washerId = null (se asigna en backend)

   Opción B: Elegir Manualmente 📋
   ├─ Ve lista de top 5-10 washers
   ├─ Ordenados por score
   ├─ Selecciona uno con radio button
   └─ washerId = ID seleccionado

   Opción C: Elegir de Favoritos ⭐
   ├─ Ve lavadores con servicios previos (rating >= 4)
   ├─ Info personalizada (tu rating, servicios previos)
   ├─ Selecciona uno con radio button
   └─ washerId = ID seleccionado
   ↓
8. Notas especiales (opcional)
   ↓
9. Click en "🚗 Confirm Booking"
   ↓
10. Backend:
    - Si modo = 'automatic': Ejecuta algoritmo y asigna mejor washer
    - Si modo = 'manual' o 'favorites': Usa washerId proporcionado
    - Crea booking
    - Crea notificación para washer
   ↓
11. Toast: "Booking created successfully!"
   ↓
12. Redirige a "My Bookings"
   ↓
✅ BOOKING CREADO
```

---

## 🎯 Algoritmo de Asignación Automática

### Cuando `washerSelectionMode === 'automatic'`:

1. **Buscar washers disponibles:**
   ```sql
   WHERE role = 'WASHER'
     AND isApproved = true
     AND isAvailable = true
     AND isActive = true
     AND latitude IS NOT NULL
     AND longitude IS NOT NULL
   ```

2. **Filtrar por service radius:**
   ```typescript
   const distanceKm = calculateDistance(
     { latitude: bookingLat, longitude: bookingLon },
     { latitude: washer.latitude, longitude: washer.longitude }
   );

   if (distanceKm > washer.serviceRadius) {
     return null; // Skip this washer
   }
   ```

3. **Calcular score:**
   ```typescript
   const score = calculateMatchScore(washer.rating, distanceKm);
   // score = (normalizedRating * 0.7) + (normalizedProximity * 0.3)
   ```

4. **Ordenar y seleccionar:**
   ```typescript
   const bestWasher = washers.sort((a, b) => b.score - a.score)[0];
   finalWasherId = bestWasher.id;
   ```

5. **Asignar y notificar:**
   ```typescript
   await prisma.booking.create({
     data: { washerId: finalWasherId, ... }
   });

   await prisma.notification.create({
     data: {
       userId: finalWasherId,
       title: 'Nueva Reserva Asignada',
       message: `Tienes una nueva reserva para ${service.name}`,
       type: 'BOOKING',
     }
   });
   ```

---

## 🧪 Testing

### Preparación:

1. **Crear washers con ubicaciones:**
   ```sql
   UPDATE User
   SET
     latitude = 37.7749,
     longitude = -122.4194,
     serviceRadius = 10,
     isAvailable = true,
     isApproved = true
   WHERE email = 'washer@demo.com';
   ```

2. **Crear bookings completados con reviews para favoritos:**
   ```bash
   npx ts-node scripts/create-test-booking.ts
   ```

### Casos de Prueba:

#### **Caso 1: Asignación Automática**
1. Login como customer
2. Click "+ New Booking"
3. Completar pasos 1-4
4. Ingresar dirección: "San Francisco, CA"
5. Esperar a "✓ Ubicación confirmada"
6. Verificar que "Asignación Automática" esté seleccionada
7. Verificar que se muestre preview del washer
8. Click "Confirm Booking"
9. Verificar:
   - ✅ Booking creado con washerId asignado
   - ✅ Washer es el de mejor score
   - ✅ Notificación creada para el washer

#### **Caso 2: Selección Manual**
1. Completar pasos 1-4
2. En paso 5, seleccionar "📋 Elegir Manualmente"
3. Verificar que se muestre lista de washers
4. Click en un washer (no el primero)
5. Verificar que se marque como seleccionado
6. Click "Confirm Booking"
7. Verificar:
   - ✅ Booking creado con el washerId seleccionado
   - ✅ Notificación creada

#### **Caso 3: Favoritos - Con favoritos disponibles**
1. Tener al menos 1 booking COMPLETED con rating >= 4
2. Completar pasos 1-4
3. En paso 5, seleccionar "⭐ Elegir de Mis Favoritos"
4. Verificar que se muestren favoritos con:
   - Tu calificación
   - Servicios previos
   - Último servicio
   - Distancia actual
5. Seleccionar uno
6. Click "Confirm Booking"
7. Verificar booking creado correctamente

#### **Caso 4: Favoritos - Sin favoritos disponibles**
1. No tener bookings completados o todos con rating < 4
2. Completar pasos 1-4
3. En paso 5, seleccionar "⭐ Elegir de Mis Favoritos"
4. Verificar mensaje:
   - "No tienes lavadores favoritos disponibles en este momento"
   - Explicación sobre qué son favoritos
5. Cambiar a otro modo para continuar

#### **Caso 5: Validaciones**
1. Intentar enviar sin seleccionar washer en modo manual:
   - ✅ Error: "Please select a washer"
2. Intentar enviar sin geocodificar dirección:
   - ✅ Error: "Please wait for address to be validated"
3. Modo automático sin washers disponibles:
   - ✅ Error: "No washers available in your area"

---

## 🔍 Verificaciones en Base de Datos

### Booking creado con asignación automática:
```sql
SELECT
  b.id,
  b.status,
  b.customerId,
  b.washerId,
  w.name as washer_name,
  w.rating as washer_rating,
  b.scheduledFor
FROM Booking b
LEFT JOIN User w ON b.washerId = w.id
WHERE b.customerId = 'CUSTOMER_ID'
ORDER BY b.createdAt DESC
LIMIT 1;
```

**Verificar:**
- ✅ `washerId` no es NULL
- ✅ `washer_rating` es el más alto de los disponibles
- ✅ `status` = 'PENDING'

### Notificación creada:
```sql
SELECT *
FROM Notification
WHERE userId = 'WASHER_ID'
  AND type = 'BOOKING'
ORDER BY createdAt DESC
LIMIT 1;
```

**Verificar:**
- ✅ `title` = 'Nueva Reserva Asignada'
- ✅ `bookingId` = ID del booking creado
- ✅ `isRead` = false

### Favoritos disponibles:
```sql
SELECT
  w.id,
  w.name,
  AVG(r.rating) as your_avg_rating,
  COUNT(b.id) as services_count,
  MAX(b.completedAt) as last_service_date
FROM User w
JOIN Booking b ON w.id = b.washerId
LEFT JOIN Review r ON b.id = r.bookingId
WHERE b.customerId = 'CUSTOMER_ID'
  AND b.status = 'COMPLETED'
  AND r.rating >= 4
  AND w.isActive = true
  AND w.isApproved = true
  AND w.isAvailable = true
GROUP BY w.id, w.name
HAVING your_avg_rating >= 4
ORDER BY your_avg_rating DESC, services_count DESC;
```

---

## 📊 Estructura de Respuestas de API

### `/api/bookings/washer-preview` (POST)

**Request:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Response (200):**
```json
{
  "washer": {
    "id": "washer123",
    "name": "Mike Washer",
    "email": "mike@example.com",
    "rating": 4.8,
    "totalReviews": 45,
    "totalJobs": 120,
    "profileImage": "/uploads/profile.jpg",
    "phone": "+1234567890",
    "distanceKm": 2.3,
    "score": 0.92
  }
}
```

**Response (404):**
```json
{
  "error": "No washers available in your area"
}
```

---

### `/api/bookings/favorite-washers` (POST)

**Request:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200) - Con favoritos:**
```json
{
  "washers": [
    {
      "id": "washer123",
      "name": "Mike Washer",
      "email": "mike@example.com",
      "rating": 4.8,
      "totalReviews": 45,
      "totalJobs": 120,
      "profileImage": "/uploads/profile.jpg",
      "phone": "+1234567890",
      "distanceKm": 3.5,
      "yourAverageRating": 5.0,
      "servicesWithYou": 3,
      "lastService": {
        "date": "2025-01-10T14:30:00.000Z",
        "serviceName": "Premium Wash",
        "rating": 5
      }
    }
  ],
  "message": null
}
```

**Response (200) - Sin favoritos:**
```json
{
  "washers": [],
  "message": "No tienes lavadores favoritos disponibles en este momento"
}
```

---

### `/api/bookings` (POST)

**Request:**
```json
{
  "serviceId": "service123",
  "vehicleId": "vehicle456",
  "scheduledFor": "2025-01-20T10:00:00",
  "address": "123 Main St, San Francisco, CA 94102",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "notes": "Please call when you arrive",
  "washerId": null,
  "washerSelectionMode": "automatic"
}
```

**Response (200):**
```json
{
  "booking": {
    "id": "booking789",
    "customerId": "customer123",
    "washerId": "washer456",
    "vehicleId": "vehicle456",
    "serviceId": "service123",
    "status": "PENDING",
    "scheduledFor": "2025-01-20T10:00:00.000Z",
    "price": 50.00,
    "totalAmount": 50.00,
    "service": {
      "name": "Premium Wash",
      "basePrice": 50.00
    },
    "vehicle": {
      "make": "Toyota",
      "model": "Camry",
      "year": 2022
    },
    "washer": {
      "id": "washer456",
      "name": "Mike Washer",
      "email": "mike@example.com",
      "rating": 4.8
    }
  },
  "washerAssignmentMode": "automatic"
}
```

**Response (404) - No washers available:**
```json
{
  "error": "No washers available in your area"
}
```

**Response (400) - Missing washer in manual mode:**
```json
{
  "error": "Please select a washer"
}
```

---

## 🎨 UI/UX Highlights

### Radio Buttons Visuales:
- **Automática:** Badge azul "Recomendado"
- **Manual:** Icono 📋 FiList
- **Favoritos:** Icono ⭐ FiStar
- Borde azul cuando seleccionado
- Hover effect en todas las opciones

### Preview Cards:
- Avatar circular o iniciales
- Rating con estrella llena amarilla
- Distancia con icono de pin
- Badge "Mejor Match" para automático
- Estadísticas en grid 2 columnas para favoritos

### Loading States:
- Spinner mientras carga preview
- Spinner mientras carga favoritos
- "Booking..." en botón de submit

### Empty States:
- Icono grande FiStar gris
- Mensaje claro y conciso
- Explicación de qué son favoritos

### Validación Visual:
- "✓ Ubicación confirmada" en verde
- Mensajes de error con toast
- Botón de submit deshabilitado si falta algo

---

## 🔧 Configuración Técnica

### Dependencias:
- **Geocoding:** Nominatim (OpenStreetMap) - Gratis, sin API key
- **Icons:** react-icons (FiZap, FiList, FiStar, FiMapPin, etc.)
- **Toast:** react-hot-toast
- **Distance Calculation:** Haversine formula (lib/haversine.ts)

### Variables de Entorno:
No se requieren variables adicionales (Nominatim es público).

### Optimizaciones:
- Geocoding solo en `onBlur` (no en cada keystroke)
- Preview se carga solo cuando modo = 'automatic'
- Favoritos se cargan solo cuando modo = 'favorites'
- WasherSelector se renderiza solo en modo = 'manual'

---

## ✅ Checklist de Integración

- [x] API endpoint para preview automático
- [x] API endpoint para favoritos
- [x] API endpoint POST /api/bookings con asignación automática
- [x] Componente WasherSelectionStep con 3 opciones
- [x] Actualización de WasherSelector para compatibilidad
- [x] Integración en Customer Dashboard
- [x] Geocoding automático de dirección
- [x] Validaciones de formulario
- [x] Notificaciones para washers
- [x] Estados de loading
- [x] Estados empty
- [x] Error handling
- [x] Reset de formulario

---

## 🎉 ¡SISTEMA COMPLETO Y FUNCIONAL!

El sistema de selección de lavadores está **100% integrado** en el flujo de booking. Los clientes ahora pueden:

- ✅ Dejar que el sistema elija automáticamente (recomendado)
- ✅ Elegir manualmente entre los mejores lavadores
- ✅ Seleccionar de sus lavadores favoritos
- ✅ Ver información detallada antes de confirmar
- ✅ Recibir asignación inteligente basada en rating y proximidad

**¡Listo para producción!** 🚀
