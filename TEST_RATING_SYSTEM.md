# 🧪 Testing del Sistema de Calificación

## ✅ Booking de Prueba Creado

El script encontró un booking COMPLETED con review y **removió la review** para que puedas probarlo.

### 📊 Detalles del Booking de Prueba:

```
Booking ID: cmhwsnp8v000d14moihtod797
Customer: customer@demo.com
Washer: washer@demo.com
Service: Standard Wash
Status: COMPLETED
Has Review: NO ✅
```

---

## 🚀 Cómo Probar el Sistema

### Paso 1: Login como Customer

1. Ve a `/login`
2. Ingresa credenciales:
   ```
   Email: customer@demo.com
   Password: demo123
   ```
3. Click "Login"

### Paso 2: Ir a "My Bookings"

1. Una vez logueado, verás el dashboard
2. Click en la pestaña **"📋 My Bookings"**
3. Deberías ver el booking de prueba con status **COMPLETED**

### Paso 3: Verificar Botón de Calificación

En el booking completado, deberías ver:
- ✅ Status: **COMPLETED** (badge verde)
- ✅ Washer: **washer@demo.com**
- ✅ Botón amarillo: **"⭐ Calificar Servicio"**

> **Nota:** Si NO ves el botón, verifica que:
> - El booking tenga status COMPLETED
> - Tenga washer asignado
> - NO tenga review (no debe aparecer un box amarillo con estrellas)

### Paso 4: Calificar el Servicio

1. **Click en "⭐ Calificar Servicio"**
   - Se abrirá el modal ReviewModal

2. **En el modal verás:**
   - Foto/inicial del washer (washer@demo.com)
   - Nombre del servicio (Standard Wash)
   - 5 estrellas interactivas

3. **Selecciona las estrellas:**
   - Pasa el mouse sobre las estrellas (hover effect)
   - Click en el número de estrellas que quieres dar (1-5)
   - Verás el texto descriptivo cambiar:
     - 1 estrella: "Muy malo"
     - 2 estrellas: "Malo"
     - 3 estrellas: "Regular"
     - 4 estrellas: "Bueno"
     - 5 estrellas: "Excelente"

4. **Escribe un comentario (opcional):**
   - Máximo 500 caracteres
   - Ejemplo: "Excelente servicio, muy profesional"
   - Verás el contador: "45/500"

5. **Click en "Enviar Reseña"**
   - El botón se deshabilitará mientras envía
   - Verás "Enviando..."

### Paso 5: Verificar Resultado

Después de enviar, deberías ver:

1. **Toast de Éxito:**
   ```
   ✅ ¡Reseña enviada exitosamente!
   ```

2. **Modal se cierra automáticamente**

3. **Lista se actualiza automáticamente**
   - El botón "⭐ Calificar Servicio" DESAPARECE
   - Aparece un box amarillo con tu calificación:
     ```
     Tu Calificación
     ⭐⭐⭐⭐⭐
     "Excelente servicio, muy profesional"
     ```

### Paso 6: Verificar Actualización del Washer

El rating del washer se actualiza automáticamente:

1. **Verificar en la misma página:**
   - En el booking, busca "Washer: washer@demo.com (X.X ⭐)"
   - El número debería haber cambiado

2. **Verificar en base de datos:**
   - Tabla `User` (washer@demo.com):
     - `rating` = promedio de todas las reviews
     - `totalReviews` = contador incrementado

3. **Verificar notificación:**
   - Tabla `Notification`:
     - Nueva notificación para el washer
     - Tipo: "REVIEW"
     - Mensaje: "Recibiste una calificación de X estrellas"

---

## 🔍 Verificaciones Adicionales

### Verificar que NO se puede calificar dos veces:

1. Recarga la página (`My Bookings`)
2. El booking COMPLETED ahora muestra la review
3. El botón "⭐ Calificar Servicio" NO debe aparecer
4. Solo se muestra el box amarillo con la calificación

### Verificar validación:

1. Abre el modal de nuevo (si creas otro booking COMPLETED)
2. NO selecciones estrellas
3. Click en "Enviar Reseña"
4. Deberías ver: "Por favor selecciona una calificación"

### Verificar comentario opcional:

1. Abre el modal
2. Selecciona estrellas
3. NO escribas comentario
4. Click en "Enviar Reseña"
5. Debería funcionar (comentario es opcional)

---

## 🗃️ Verificar en Base de Datos

### Review creado:

```sql
SELECT * FROM Review
WHERE bookingId = 'cmhwsnp8v000d14moihtod797';
```

Deberías ver:
- `id`: UUID
- `bookingId`: cmhwsnp8v000d14moihtod797
- `reviewerId`: customer@demo.com ID
- `reviewedId`: washer@demo.com ID
- `rating`: 1-5
- `comment`: Tu comentario o NULL
- `createdAt`: Timestamp

### Washer actualizado:

```sql
SELECT id, name, email, rating, totalReviews
FROM User
WHERE email = 'washer@demo.com';
```

Deberías ver:
- `rating`: Promedio calculado (ej: 4.5)
- `totalReviews`: Incrementado (ej: 3)

### Notificación creada:

```sql
SELECT * FROM Notification
WHERE userId = (SELECT id FROM User WHERE email = 'washer@demo.com')
ORDER BY createdAt DESC
LIMIT 1;
```

Deberías ver:
- `title`: "Nueva Reseña Recibida"
- `message`: "Recibiste una calificación de X estrellas"
- `type`: "REVIEW"
- `isRead`: false
- `bookingId`: cmhwsnp8v000d14moihtod797

---

## 🔄 Crear Más Bookings de Prueba

Si quieres probar más veces:

### Opción 1: Ejecutar el script de nuevo

```bash
npx ts-node scripts/create-test-booking.ts
```

El script:
- Si encuentra bookings COMPLETED con review → Elimina la review del primero
- Si no encuentra → Crea un nuevo booking COMPLETED sin review

### Opción 2: Eliminar review manualmente en BD

```sql
-- 1. Eliminar review
DELETE FROM Review WHERE bookingId = 'cmhwsnp8v000d14moihtod797';

-- 2. Recalcular rating del washer (opcional, o déjalo para el próximo review)
UPDATE User
SET rating = 0, totalReviews = 0
WHERE email = 'washer@demo.com';
```

### Opción 3: Cambiar status de booking existente

```sql
-- Cambiar un booking PENDING a COMPLETED
UPDATE Booking
SET
  status = 'COMPLETED',
  completedAt = NOW() - INTERVAL '1 day',
  startedAt = NOW() - INTERVAL '1 day'
WHERE id = 'BOOKING_ID_AQUI';
```

---

## ❌ Problemas Comunes y Soluciones

### No veo el botón "Calificar Servicio"

**Posibles causas:**
1. ❌ El booking NO está COMPLETED
   - Solución: Actualiza status a COMPLETED en BD

2. ❌ El booking NO tiene washer asignado
   - Solución: Asigna un washer en BD: `UPDATE Booking SET washerId = '...' WHERE id = '...'`

3. ❌ El booking YA tiene review
   - Solución: Elimina la review: `DELETE FROM Review WHERE bookingId = '...'`

### Modal no se abre

**Posibles causas:**
1. ❌ Error en consola del navegador
   - Solución: Abre DevTools (F12) y revisa errores

2. ❌ ReviewModal no importado
   - Solución: Verifica que `import ReviewModal from '@/components/modals/ReviewModal'` esté en el dashboard

### Review no se guarda

**Posibles causas:**
1. ❌ API /api/reviews no responde
   - Solución: Revisa logs del servidor

2. ❌ Customer ID no se envía
   - Solución: Verifica que `user?.id` esté disponible

3. ❌ Booking ID incorrecto
   - Solución: Verifica en Network tab del navegador

### Rating del washer no se actualiza

**Verifica:**
1. ✅ La función `updateWasherRating` se ejecuta en `/api/reviews`
2. ✅ El washer tiene `id` correcto en la tabla `User`
3. ✅ No hay errores en logs del servidor

---

## 📊 Ejemplo de Flujo Completo

```
1. Login as customer@demo.com
   ↓
2. Click "My Bookings"
   ↓
3. Ver booking COMPLETED (Standard Wash)
   ↓
4. Click "⭐ Calificar Servicio"
   ↓
5. Modal abierto → Seleccionar 5 estrellas
   ↓
6. Escribir: "Excelente servicio, muy profesional"
   ↓
7. Click "Enviar Reseña"
   ↓
8. Toast: "¡Reseña enviada exitosamente!"
   ↓
9. Modal cierra
   ↓
10. Lista actualiza automáticamente
   ↓
11. Botón desaparece
   ↓
12. Aparece box amarillo con review
   ↓
✅ ÉXITO
```

---

## 🎯 Checklist de Testing

- [ ] Login como customer@demo.com
- [ ] Ver "My Bookings"
- [ ] Booking COMPLETED visible
- [ ] Botón "⭐ Calificar Servicio" presente
- [ ] Click en botón → Modal abre
- [ ] Estrellas interactivas funcionan
- [ ] Hover effect en estrellas
- [ ] Texto descriptivo cambia según estrellas
- [ ] Comentario opcional funciona
- [ ] Contador de caracteres (X/500)
- [ ] Validación: requiere al menos 1 estrella
- [ ] Click "Enviar Reseña"
- [ ] Loading state ("Enviando...")
- [ ] Toast de éxito aparece
- [ ] Modal se cierra
- [ ] Lista se actualiza automáticamente
- [ ] Botón desaparece
- [ ] Review aparece en box amarillo
- [ ] Rating del washer actualizado
- [ ] NO se puede calificar dos veces
- [ ] Review en BD
- [ ] Notificación en BD

---

## ✅ Sistema Completamente Funcional

Si todos los checks pasan, el sistema de calificación está **100% funcional** y listo para producción! 🎉

**Booking de Prueba Disponible:**
- ID: `cmhwsnp8v000d14moihtod797`
- Customer: `customer@demo.com`
- Password: `demo123`
- Status: COMPLETED
- Review: NONE (listo para calificar)

¡Disfruta probando el sistema! 🚀
