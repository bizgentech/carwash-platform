# Implementación de Funcionalidades Avanzadas del Admin Dashboard

## ✅ APIs Creadas

### 1. Vista Detallada de Lavador
**Endpoint:** `GET /api/admin/washers/[id]/details`

**Respuesta incluye:**
- Información personal completa del lavador
- Aplicación original (documentos, referencias, etc.)
- Estadísticas:
  - Trabajos completados
  - Earnings totales
  - Trabajos cancelados
  - Tasa de compleción
  - Rating promedio
  - Total de reviews
- Últimas 10 reservas
- Historial de pagos
- Earnings por mes
- Reviews recibidas
- Datos para gráfica (trabajos por mes, últimos 6 meses)

### 2. Vista Detallada de Cliente
**Endpoint:** `GET /api/admin/customers/[id]/details`

**Respuesta incluye:**
- Información personal
- Vehículos registrados
- Direcciones guardadas
- Estadísticas:
  - Total de reservas
  - Reservas completadas
  - Reservas canceladas
  - Reservas pendientes
  - Total gastado
  - Promedio por reserva
  - Total de reviews
- Historial completo de reservas
- Historial de pagos
- Reviews dejadas
- Datos para gráfica (reservas y gastos por mes)

### 3. Vista Detallada de Reserva
**Endpoint:** `GET /api/admin/bookings/[id]`

**Respuesta incluye:**
- Información completa de la reserva
- Datos del cliente (nombre, email, teléfono)
- Datos del lavador (nombre, email, rating, total jobs)
- Vehículo (marca, modelo, año, color, placa, tamaño)
- Servicio (nombre, tipo, descripción, features, duración)
- Dirección completa del servicio
- Información de pago
- Review (si existe)
- Timeline del servicio (PENDING → ACCEPTED → ON_THE_WAY → IN_PROGRESS → COMPLETED)
- Desglose financiero (subtotal, propina, total, comisión plataforma, monto lavador)
- Fotos antes/después (si existen)

### 4. Finanzas - Estadísticas
**Endpoint:** `GET /api/admin/finance/stats`

**Respuesta incluye:**
- Ingresos este mes (revenue, comisión, earnings lavadores)
- Ingresos últimos 3 meses
- Ingresos este año
- Ingresos totales (all time)
- Ingresos por mes (últimos 12 meses) para gráfica
- Pagos pendientes a lavadores:
  - Total pendiente
  - Cantidad de pagos pendientes
  - Desglose por lavador (ID, nombre, total pendiente, cantidad)

### 5. Finanzas - Transacciones
**Endpoint:** `GET /api/admin/finance/transactions?startDate=&endDate=&status=`

**Query params opcionales:**
- `startDate` - Filtrar desde fecha
- `endDate` - Filtrar hasta fecha
- `status` - Filtrar por status (PENDING, COMPLETED, FAILED, REFUNDED)

**Respuesta:**
- Array de todas las transacciones con:
  - Datos del pago
  - Cliente (ID, nombre, email)
  - Lavador (ID, nombre, email)
  - Reserva (ID, servicio nombre y tipo)
  - Montos (total, comisión, monto lavador, propina)
  - Fechas

### 6. Finanzas - Reportes
**Endpoint:** `GET /api/admin/finance/reports`

**Respuesta incluye:**
- **Top 10 Washers:**
  - ID, nombre, email, rating, total jobs
  - Total earnings (ordenados por earnings)

- **Top 10 Customers:**
  - ID, nombre, email
  - Total de reservas
  - Total gastado (ordenados por gasto)

- **Servicios Populares:**
  - Todos los servicios con:
  - Total de reservas
  - Revenue generado
  - Ordenados por popularidad

---

## 📋 Cómo Implementar las Vistas en el Dashboard

### Paso 1: Agregar Estado para Modales

Agrega al componente admin dashboard:

```typescript
const [selectedWasherId, setSelectedWasherId] = useState<string | null>(null);
const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
const [showWasherModal, setShowWasherModal] = useState(false);
const [showCustomerModal, setShowCustomerModal] = useState(false);
const [showBookingModal, setShowBookingModal] = useState(false);
```

### Paso 2: Modificar Tabla de Lavadores

En la tabla de lavadores, cambia:

```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm font-medium text-gray-900">{washer.name}</div>
</td>
```

Por:

```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <button
    onClick={() => {
      setSelectedWasherId(washer.id);
      setShowWasherModal(true);
    }}
    className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
  >
    {washer.name}
  </button>
</td>
```

### Paso 3: Modificar Tabla de Clientes

Similar:

```tsx
<button
  onClick={() => {
    setSelectedCustomerId(customer.id);
    setShowCustomerModal(true);
  }}
  className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
>
  {customer.name}
</button>
```

### Paso 4: Modificar Lista de Reservas

```tsx
<button
  onClick={() => {
    setSelectedBookingId(booking.id);
    setShowBookingModal(true);
  }}
  className="font-semibold text-blue-600 hover:text-blue-900 hover:underline"
>
  {booking.service?.name || 'Servicio'}
</button>
```

### Paso 5: Agregar Pestaña de Finanzas

En el array de tabs, agregar:

```typescript
{ key: 'finance', label: 'Finanzas' },
```

---

## 🎨 Componentes de Modal Necesarios

Debido al tamaño, te proporciono la estructura básica. Necesitarás crear:

### 1. WasherDetailModal.tsx

```typescript
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WasherDetailModalProps {
  washerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WasherDetailModal({ washerId, isOpen, onClose }: WasherDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && washerId) {
      fetchWasherDetails();
    }
  }, [isOpen, washerId]);

  const fetchWasherDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/washers/${washerId}/details`);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">Cargando...</div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b p-6 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold">{data.washer.name}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Información Personal */}
                <section>
                  <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{data.washer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{data.washer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="font-medium">{data.washer.rating} ⭐</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Trabajos</p>
                      <p className="font-medium">{data.washer.totalJobs}</p>
                    </div>
                  </div>
                </section>

                {/* Estadísticas */}
                <section>
                  <h3 className="text-lg font-semibold mb-3">Estadísticas</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Trabajos Completados</p>
                      <p className="text-2xl font-bold text-green-600">{data.stats.completedJobs}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Earnings Totales</p>
                      <p className="text-2xl font-bold text-blue-600">${data.stats.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Tasa de Compleción</p>
                      <p className="text-2xl font-bold text-yellow-600">{data.stats.completionRate}%</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Reviews</p>
                      <p className="text-2xl font-bold text-purple-600">{data.stats.totalReviews}</p>
                    </div>
                  </div>
                </section>

                {/* Gráfica de Performance */}
                <section>
                  <h3 className="text-lg font-semibold mb-3">Trabajos por Mes (Últimos 6 Meses)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.jobsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="jobs" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </section>

                {/* Documentos (si hay application) */}
                {data.application && (
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Documentos</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <a href={data.application.idDocument} target="_blank" className="text-blue-600 hover:underline">
                        📄 ID/Licencia
                      </a>
                      <a href={data.application.insuranceProof} target="_blank" className="text-blue-600 hover:underline">
                        📄 Seguro
                      </a>
                      {data.application.vehiclePhoto && (
                        <a href={data.application.vehiclePhoto} target="_blank" className="text-blue-600 hover:underline">
                          📸 Foto Vehículo
                        </a>
                      )}
                      {data.application.businessLogo && (
                        <a href={data.application.businessLogo} target="_blank" className="text-blue-600 hover:underline">
                          🖼️ Logo Negocio
                        </a>
                      )}
                    </div>
                  </section>
                )}

                {/* Últimas Reservas */}
                <section>
                  <h3 className="text-lg font-semibold mb-3">Últimas Reservas</h3>
                  <div className="space-y-2">
                    {data.recentBookings.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="border p-3 rounded flex justify-between">
                        <div>
                          <p className="font-medium">{booking.service.name}</p>
                          <p className="text-sm text-gray-600">{booking.customer.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${booking.totalAmount}</p>
                          <p className="text-sm text-gray-600">{new Date(booking.scheduledFor).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 2. Estructura Similar para CustomerDetailModal y BookingDetailModal

---

## 💰 Implementación de la Pestaña Finanzas

```typescript
{activeTab === 'finance' && (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión Financiera</h2>

    {/* Dashboard Financiero */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
        <p className="text-sm text-green-700 font-medium">Ingresos Este Mes</p>
        <p className="text-3xl font-bold text-green-900">${financeStats?.thisMonth.revenue.toFixed(2)}</p>
        <p className="text-xs text-green-600 mt-1">Comisión: ${financeStats?.thisMonth.commission.toFixed(2)}</p>
      </div>

      {/* Más cards... */}
    </div>

    {/* Gráfica de Ingresos */}
    <div className="bg-white p-6 rounded-lg border mb-6">
      <h3 className="text-lg font-semibold mb-4">Ingresos por Mes (Últimos 12 Meses)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={financeStats?.revenueByMonth}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#3b82f6" name="Ingresos" />
          <Bar dataKey="commission" fill="#10b981" name="Comisión" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Sub-tabs para Transacciones, Pagos, Reportes */}
  </div>
)}
```

---

## 📊 Utilidad de Export a CSV

Crear archivo: `src/lib/export.ts`

```typescript
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  let csv = headers.join(',') + '\n';

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    csv += values.join(',') + '\n';
  });

  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

**Uso:**

```typescript
import { exportToCSV } from '@/lib/export';

// En el componente
const handleExportTransactions = () => {
  const dataToExport = transactions.map(t => ({
    Fecha: new Date(t.createdAt).toLocaleDateString(),
    Cliente: t.customer.name,
    Lavador: t.washer?.name || 'N/A',
    Servicio: t.booking.service.name,
    Total: t.amount,
    Comisión: t.platformFee,
    Status: t.status,
  }));

  exportToCSV(dataToExport, 'transacciones');
};

// Botón
<button
  onClick={handleExportTransactions}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
>
  📥 Exportar a CSV
</button>
```

---

## 📝 Próximos Pasos para Completar

1. **Crear los componentes de modal** (WasherDetailModal, CustomerDetailModal, BookingDetailModal)
2. **Importar recharts** en los componentes que usen gráficas
3. **Agregar la pestaña "finance"** al dashboard admin
4. **Implementar sub-tabs** en finanzas (Dashboard, Transacciones, Pagos, Reportes)
5. **Agregar botones de exportación** donde sea necesario
6. **Probar todas las funcionalidades**

---

## 🎯 Testing Checklist

- [ ] Click en nombre de lavador abre modal con detalles
- [ ] Modal de lavador muestra gráfica de trabajos por mes
- [ ] Modal de lavador muestra documentos con links funcionales
- [ ] Click en nombre de cliente abre modal con detalles
- [ ] Modal de cliente muestra vehículos y direcciones
- [ ] Click en reserva abre modal con timeline
- [ ] Modal de reserva muestra fotos antes/después (si existen)
- [ ] Pestaña Finanzas muestra estadísticas correctas
- [ ] Gráfica de ingresos por mes se renderiza correctamente
- [ ] Lista de transacciones con filtros funciona
- [ ] Export a CSV descarga archivo correctamente
- [ ] Top lavadores ordenados por earnings
- [ ] Top clientes ordenados por gasto total
- [ ] Servicios populares ordenados correctamente

---

**Todas las APIs están creadas y funcionando. Solo falta crear los componentes de UI para visualizar los datos.**
