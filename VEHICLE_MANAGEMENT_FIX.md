# 🔧 Fix: Add Vehicle Form Not Working

## ❌ Problema Identificado

El formulario "Add Vehicle" en el Customer Dashboard no funcionaba porque **faltaba el endpoint de API `/api/vehicles`**.

### Error Original:
```
Error: Failed to add vehicle
Causa: El endpoint POST /api/vehicles no existía
```

---

## ✅ Solución Implementada

### 1. **Creado: `/api/vehicles` API Endpoint**

**Ubicación:** `src/app/api/vehicles/route.ts`

**Métodos implementados:**

#### **POST /api/vehicles** - Crear vehículo
- Autenticación: Bearer token requerido
- Valida campos requeridos (make, model, year, color, size)
- Valida año (1900 - current year + 1)
- Valida size (SMALL, MEDIUM, LARGE, XL, EXTRA_LARGE)
- Si es el primer vehículo del usuario → automáticamente `isDefault = true`
- Si `isDefault = true` → desmarca otros vehículos como default

**Request:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "color": "Silver",
  "plateNumber": "ABC123",
  "size": "MEDIUM",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "vehicle": {
    "id": "vehicle123",
    "userId": "user456",
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "color": "Silver",
    "plateNumber": "ABC123",
    "size": "MEDIUM",
    "isDefault": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

---

#### **GET /api/vehicles** - Listar vehículos del usuario
- Autenticación: Bearer token requerido
- Ordenado por: default primero, luego por fecha de creación

**Response (200):**
```json
{
  "vehicles": [
    {
      "id": "vehicle123",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "color": "Silver",
      "plateNumber": "ABC123",
      "size": "MEDIUM",
      "isDefault": true,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

#### **PATCH /api/vehicles** - Actualizar vehículo
- Autenticación: Bearer token requerido
- Valida que el vehículo pertenezca al usuario
- Si se marca como default → desmarca otros

**Request:**
```json
{
  "id": "vehicle123",
  "color": "Black",
  "isDefault": true
}
```

**Response (200):**
```json
{
  "vehicle": {
    "id": "vehicle123",
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "color": "Black",
    "plateNumber": "ABC123",
    "size": "MEDIUM",
    "isDefault": true,
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

---

#### **DELETE /api/vehicles** - Eliminar vehículo
- Autenticación: Bearer token requerido
- Valida que el vehículo pertenezca al usuario
- **Previene eliminación si tiene bookings asociados**
- Si era default → marca otro vehículo como default automáticamente

**Request:**
```
DELETE /api/vehicles?id=vehicle123
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "message": "Vehicle deleted successfully"
}
```

**Response (400) - Con bookings:**
```json
{
  "error": "Cannot delete vehicle with existing bookings"
}
```

---

### 2. **Corregido: Vehicle Size Select**

**Problema:** El select del formulario usaba `value="XL"` pero algunas partes esperaban `"EXTRA_LARGE"`.

**Solución:**
- Actualizado el formulario para usar `value="EXTRA_LARGE"`
- API acepta **ambos valores** (XL y EXTRA_LARGE) para compatibilidad

**Antes:**
```tsx
<option value="XL">Extra Large (Truck)</option>
```

**Después:**
```tsx
<option value="EXTRA_LARGE">Extra Large (Truck)</option>
```

**Validación en API:**
```typescript
const validSizes = ['SMALL', 'MEDIUM', 'LARGE', 'XL', 'EXTRA_LARGE'];
```

---

## 🔄 Flujo Completo del Usuario

### Agregar Vehículo:

```
1. Login como customer
   ↓
2. Ir a "My Profile"
   ↓
3. Scroll hasta "My Vehicles"
   ↓
4. Click "+ Add Vehicle"
   ↓
5. Formulario se expande:
   - Make: Toyota
   - Model: Camry
   - Year: 2022
   - Color: Silver
   - Plate Number: ABC123 (opcional)
   - Size: Medium (Sedan)
   ↓
6. Click "Add Vehicle"
   ↓
7. Backend:
   - Valida campos
   - Si es primer vehículo → isDefault = true
   - Crea vehículo en BD
   - Retorna vehículo creado
   ↓
8. Frontend:
   - Toast: "Vehicle added successfully!"
   - Formulario se oculta
   - Lista de vehículos se actualiza
   - Nuevo vehículo aparece con badge "Default" (si aplica)
   ↓
✅ VEHÍCULO AGREGADO
```

---

## 📋 Validaciones Implementadas

### Campos Requeridos:
- ✅ Make (marca)
- ✅ Model (modelo)
- ✅ Year (año)
- ✅ Color
- ✅ Size (tamaño)
- ⚪ Plate Number (opcional)

### Validaciones de Año:
```typescript
if (year < 1900 || year > currentYear + 1) {
  return { error: 'Invalid year' }
}
```

### Validaciones de Size:
```typescript
const validSizes = ['SMALL', 'MEDIUM', 'LARGE', 'XL', 'EXTRA_LARGE'];
if (!validSizes.includes(size)) {
  return { error: 'Invalid size...' }
}
```

### Validación de Pertenencia:
```typescript
const vehicle = await prisma.vehicle.findFirst({
  where: { id, userId }
});
if (!vehicle) {
  return { error: 'Vehicle not found or does not belong to you' }
}
```

### Protección de Eliminación:
```typescript
const bookingsCount = await prisma.booking.count({
  where: { vehicleId }
});
if (bookingsCount > 0) {
  return { error: 'Cannot delete vehicle with existing bookings' }
}
```

---

## 🎯 Lógica de Default Vehicle

### Al crear primer vehículo:
```typescript
const existingVehicles = await prisma.vehicle.count({ where: { userId } });
const shouldBeDefault = isDefault || existingVehicles === 0;
```

### Al marcar como default:
```typescript
if (isDefault) {
  // Desmarcar otros vehículos del usuario
  await prisma.vehicle.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false }
  });
}
```

### Al eliminar vehículo default:
```typescript
if (vehicle.isDefault) {
  // Marcar el próximo vehículo como default
  const firstVehicle = await prisma.vehicle.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  });

  if (firstVehicle) {
    await prisma.vehicle.update({
      where: { id: firstVehicle.id },
      data: { isDefault: true }
    });
  }
}
```

---

## 🧪 Testing

### Caso 1: Crear Primer Vehículo
```bash
# Login
POST /api/auth/login
{
  "email": "customer@demo.com",
  "password": "demo123"
}

# Crear vehículo
POST /api/vehicles
Authorization: Bearer YOUR_TOKEN
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "color": "Silver",
  "plateNumber": "ABC123",
  "size": "MEDIUM"
}

# Verificar
✅ Vehicle created
✅ isDefault = true (automático, primer vehículo)
✅ Toast success
✅ Formulario se oculta
✅ Vehículo aparece en lista con badge "Default"
```

### Caso 2: Crear Segundo Vehículo
```bash
POST /api/vehicles
{
  "make": "Honda",
  "model": "Civic",
  "year": 2023,
  "color": "Black",
  "plateNumber": "XYZ789",
  "size": "SMALL"
}

# Verificar
✅ Vehicle created
✅ isDefault = false (ya existe otro default)
✅ Toast success
✅ Ambos vehículos visibles en lista
```

### Caso 3: Marcar Como Default
```bash
PATCH /api/vehicles
{
  "id": "vehicle_honda_id",
  "isDefault": true
}

# Verificar
✅ Honda ahora tiene badge "Default"
✅ Toyota ya NO tiene badge "Default"
```

### Caso 4: Eliminar Vehículo Sin Bookings
```bash
DELETE /api/vehicles?id=vehicle_toyota_id

# Verificar
✅ Vehicle deleted
✅ Si era default, Honda ahora es default
✅ Solo queda Honda en la lista
```

### Caso 5: Intentar Eliminar Con Bookings
```bash
# Crear booking con el vehículo primero
POST /api/bookings
{
  "vehicleId": "vehicle_honda_id",
  ...
}

# Intentar eliminar
DELETE /api/vehicles?id=vehicle_honda_id

# Verificar
❌ Error: "Cannot delete vehicle with existing bookings"
✅ Vehículo NO se elimina
✅ Toast error mostrado
```

### Caso 6: Validación de Campos
```bash
POST /api/vehicles
{
  "make": "",
  "model": "Civic"
}

# Verificar
❌ Error: "Missing required fields"
```

```bash
POST /api/vehicles
{
  "make": "Honda",
  "model": "Civic",
  "year": 1800,  # Año inválido
  "color": "Black",
  "size": "MEDIUM"
}

# Verificar
❌ Error: "Invalid year"
```

```bash
POST /api/vehicles
{
  "make": "Honda",
  "model": "Civic",
  "year": 2023,
  "color": "Black",
  "size": "GIGANTE"  # Size inválido
}

# Verificar
❌ Error: "Invalid size. Must be SMALL, MEDIUM, LARGE, XL, or EXTRA_LARGE"
```

---

## 🔍 Verificación en Base de Datos

### Ver vehículos de un usuario:
```sql
SELECT
  id,
  make,
  model,
  year,
  color,
  plateNumber,
  size,
  isDefault,
  createdAt
FROM Vehicle
WHERE userId = 'USER_ID'
ORDER BY isDefault DESC, createdAt DESC;
```

### Verificar que solo hay 1 default:
```sql
SELECT
  userId,
  COUNT(*) as default_count
FROM Vehicle
WHERE isDefault = true
GROUP BY userId
HAVING default_count > 1;
```
**Debe retornar 0 filas** (no debe haber usuarios con múltiples defaults)

### Ver vehículos con bookings:
```sql
SELECT
  v.id,
  v.make,
  v.model,
  COUNT(b.id) as bookings_count
FROM Vehicle v
LEFT JOIN Booking b ON v.id = b.vehicleId
GROUP BY v.id, v.make, v.model;
```

---

## 📊 Código Frontend (Customer Dashboard)

### Estado del formulario:
```typescript
const [vehicleForm, setVehicleForm] = useState({
  make: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  plateNumber: '',
  size: 'MEDIUM',
})
```

### Submit handler:
```typescript
const handleAddVehicle = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleForm),
    })

    if (response.ok) {
      toast.success('Vehicle added successfully!')
      setShowVehicleForm(false)
      setVehicleForm({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        plateNumber: '',
        size: 'MEDIUM',
      })
      fetchVehicles()
    } else {
      const data = await response.json()
      toast.error(data.error || 'Failed to add vehicle')
    }
  } catch (error) {
    toast.error('Something went wrong')
  } finally {
    setLoading(false)
  }
}
```

### Fetch vehicles:
```typescript
const fetchVehicles = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/vehicles', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (response.ok) {
      const data = await response.json()
      setVehicles(data.vehicles || [])
    }
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
}
```

---

## ✅ Checklist de Fix

- [x] Endpoint POST /api/vehicles creado
- [x] Endpoint GET /api/vehicles creado
- [x] Endpoint PATCH /api/vehicles creado
- [x] Endpoint DELETE /api/vehicles creado
- [x] Validación de campos requeridos
- [x] Validación de año
- [x] Validación de size
- [x] Validación de pertenencia de vehículo
- [x] Lógica de default vehicle
- [x] Protección contra eliminación con bookings
- [x] Auto-asignación de default al primer vehículo
- [x] Auto-reasignación de default al eliminar
- [x] Corregido value de size select (XL → EXTRA_LARGE)
- [x] API acepta ambos valores (XL y EXTRA_LARGE)
- [x] Toast notifications
- [x] Loading states
- [x] Error handling
- [x] Form reset después de submit exitoso

---

## 🎉 ¡PROBLEMA RESUELTO!

El formulario de agregar vehículos ahora funciona **100%**:

- ✅ Usuarios pueden agregar vehículos desde "My Profile"
- ✅ Validaciones completas en frontend y backend
- ✅ Gestión automática de vehículo default
- ✅ Protección de datos (solo el dueño puede modificar/eliminar)
- ✅ Prevención de eliminación si tiene bookings
- ✅ Feedback claro al usuario con toasts

**¡Listo para usar!** 🚀

---

## 📝 Notas Adicionales

### Tamaños de Vehículos:
- **SMALL**: Compactos (Honda Civic, Toyota Corolla)
- **MEDIUM**: Sedanes (Toyota Camry, Honda Accord)
- **LARGE**: SUVs (Toyota RAV4, Honda CR-V)
- **EXTRA_LARGE** (o XL): Trucks (Ford F-150, Chevrolet Silverado)

### Plate Number:
- Campo opcional
- Útil para identificar vehículos en estacionamientos
- No hay validación de formato (varía por país/estado)

### Default Vehicle:
- Usado automáticamente en booking form si no se especifica otro
- Solo puede haber 1 default por usuario
- El primer vehículo siempre es default
- Si se elimina el default, el siguiente más antiguo se vuelve default

### Performance:
- Query optimizada con `orderBy` en GET
- Update optimizado con `updateMany` para desmarcar defaults
- Validación de bookings con simple `count` (rápido)
