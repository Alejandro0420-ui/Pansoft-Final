# 📬 Notificaciones Automáticas - Guía Completa

## 🎯 Notificaciones Implementadas

### 1. **Facturas Vencidas** 💳

- **Cuándo**: Cuando una factura no pagada está vencida
- **Frecuencia**: Cada hora (verificación automática)
- **Acción desencadenante**: Creación de factura con fecha de vencimiento
- **Endpoint manual**: `POST /api/billing/check/overdue`

### 2. **Facturas Próximas a Vencer** 📅

- **Cuándo**: Cuando una factura vence en 3 días o menos
- **Frecuencia**: Cada 12 horas (verificación automática)
- **Acción desencadenante**: Creación de factura
- **Endpoint manual**: `POST /api/billing/check/upcoming`
- **Parámetros**: `{ daysWarning: 3 }` (personalizable)

### 3. **Stock Crítico (Productos)** 🚨

- **Cuándo**: Cuando un producto tiene menos del 30% del stock mínimo
- **Frecuencia**: Cada 30 minutos (verificación automática)
- **Acción desencadenante**: Actualización de inventario
- **Endpoint manual**: `POST /api/inventory/check/critical-stock`

### 4. **Productos con Stock Bajo** 📦

- **Cuándo**: Cuando un producto tiene entre 30% y 100% del stock mínimo
- **Frecuencia**: Cada 45 minutos (verificación automática)
- **Acción desencadenante**: Actualización de inventario
- **Endpoint manual**: `POST /api/inventory/check/low-stock`

### 5. **Insumos con Stock Bajo** 📋

- **Cuándo**: Cuando un insumo tiene entre 30% y 100% del stock mínimo
- **Frecuencia**: Cada 45 minutos (verificación automática)
- **Acción desencadenante**: Actualización de inventario
- **Endpoint manual**: `POST /api/supplies/check/low-stock`

### 6. **Nueva Orden Creada** 📋

- **Cuándo**: Inmediatamente después de crear una nueva orden
- **Frecuencia**: Instantánea (en tiempo real)
- **Acción desencadenante**: `POST /api/orders`
- **Información**: ID orden, cliente, monto total

---

## 🔄 Tareas Programadas (Automáticas)

El servidor ejecuta automáticamente las siguientes tareas al iniciar:

| Tarea                | Intervalo  | Primera ejecución | Descripción                                  |
| -------------------- | ---------- | ----------------- | -------------------------------------------- |
| Facturas vencidas    | 1 hora     | 30 segundos       | Busca facturas no pagadas vencidas           |
| Próximas a vencer    | 12 horas   | 1 minuto          | Facturas próximas a vencer en 3 días         |
| Stock crítico        | 30 minutos | 90 segundos       | Productos con stock < 30% del mínimo         |
| Productos bajo stock | 45 minutos | 2 minutos         | Productos con stock entre 30-100% del mínimo |
| Insumos bajo stock   | 45 minutos | 2.5 minutos       | Insumos con stock entre 30-100% del mínimo   |

---

## 🔌 Endpoints Manuales

Si necesitas ejecutar verificaciones manualmente:

### Verificar Facturas Vencidas

```bash
POST /api/billing/check/overdue
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Facturas vencidas verificadas"
}
```

### Verificar Próximas a Vencer

```bash
POST /api/billing/check/upcoming
Content-Type: application/json

{
  "daysWarning": 3
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Facturas próximas a vencer verificadas"
}
```

### Verificar Stock Crítico (Productos)

```bash
POST /api/inventory/check/critical-stock
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Verificación de stock crítico completada"
}
```

### Verificar Productos con Stock Bajo

```bash
POST /api/inventory/check/low-stock
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Verificación de productos con stock bajo completada"
}
```

### Verificar Insumos con Stock Bajo

```bash
POST /api/supplies/check/low-stock
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Verificación de insumos con stock bajo completada"
}
```

---

## 📊 Tipos de Notificaciones (Logística)

### Facturas Vencidas

```javascript
{
  type: "warning",
  title: "💳 Factura vencida",
  message: "Factura #FAC-123456 vencida hace 5 días. Monto: $2,500",
  icon: "AlertTriangle",
  color: "#FF6B6B"
}
```

### Próximas a Vencer

```javascript
{
  type: "info",
  title: "📅 Factura próxima a vencer",
  message: "Factura #FAC-789000 vence en 2 días. Monto: $1,500",
  icon: "Info",
  color: "#FFD93D"
}
```

### Stock Crítico (Productos)

```javascript
{
  type: "warning",
  title: "🚨 Stock crítico",
  message: "Harina tiene solo 2 unidades (mínimo crítico: 10)",
  icon: "AlertTriangle",
  color: "#FF6B6B"
}
```

### Productos con Stock Bajo

```javascript
{
  type: "inventory",
  title: "📦 Producto con stock bajo",
  message: "Azúcar tiene solo 15 unidades (mínimo: 20)",
  icon: "Package",
  color: "#FFD93D"
}
```

### Insumos con Stock Bajo

```javascript
{
  type: "inventory",
  title: "📋 Insumo con stock bajo",
  message: "Levadura tiene solo 5 unidades (mínimo: 10)",
  icon: "AlertCircle",
  color: "#FFA500"
}
```

### Nueva Orden

```javascript
{
  type: "order",
  title: "📋 Nueva orden creada",
  message: "Orden #5 de Juan Pérez por $2,450",
  icon: "ShoppingCart",
  color: "#4ECDC4"
}
```

---

## 🛠️ Flujo de Integración (Detrás de Escenas)

### Cuando se crea una orden:

```
POST /api/orders
    ↓
1. Insertar orden en BD
2. Insertar items de orden
3. Obtener nombre del cliente
4. Crear notificación automática
5. Responder al cliente
```

### Cuando se ejecuta tarea de facturas vencidas:

```
Tarea programada (cada hora)
    ↓
1. Buscar facturas no pagadas vencidas
2. Para cada factura:
   - Verificar si ya existe notificación
   - Si no existe, crear nueva notificación
3. Registrar en logs
```

### Cuando se verifica stock crítico:

```
Tarea programada (cada 30 min)
    ↓
1. Buscar productos con stock < 30% del mínimo
2. Para cada producto:
   - Verificar si existe notificación reciente (< 1 día)
   - Si no existe, crear nueva notificación
3. Registrar en logs
```

---

## 📝 Logs del Sistema

El servidor mostrará mensajes como estos:

```
🔔 [Tarea] Verificando facturas vencidas...
✓ Verificadas 3 facturas vencidas
✓ Notificación creada: 💳 Factura vencida

🔔 [Tarea] Verificando stock crítico...
✓ Verificados 5 productos con stock crítico
✓ Notificación creada: 🚨 Stock crítico
```

---

## 🎯 Monitoreo en Frontend

En `/components/notifications.jsx`:

1. **Auto-actualización**: Cada 10 segundos
2. **Filtros disponibles**:
   - Todas las notificaciones
   - Solo sin leer
3. **Acciones**:
   - Marcar como leída
   - Eliminar notificación
   - Marcar todas como leídas
   - Eliminar todas las leídas

---

## 📋 Checklist de Implementación

- ✅ Tabla `notifications` en MySQL (automática)
- ✅ API `/api/notifications` (CRUD completo)
- ✅ Notificaciones de facturas vencidas
- ✅ Notificaciones de próximas a vencer
- ✅ Notificaciones de stock crítico (productos)
- ✅ Notificaciones de productos con stock bajo
- ✅ Notificaciones de insumos con stock bajo
- ✅ Notificaciones de nuevas órdenes
- ✅ Tareas programadas automáticas (5 tareas)
- ✅ Frontend component (React)
- ✅ Auto-actualización cada 10 segundos

---

## 🚀 Próximas Mejoras

- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Notificaciones por email
- [ ] Notificaciones push
- [ ] Dashboard de estadísticas de notificaciones
- [ ] Configuración de preferencias por usuario
- [ ] Historial detallado con búsqueda
- [ ] Exporta reportes de notificaciones

---

## 🔧 Solución de Problemas

### No aparecen notificaciones

1. Verificar que MySQL esté corriendo
2. Verificar que la tabla `notifications` exista
3. Verificar logs del servidor: `node backend/server.js`
4. Ejecutar verificación manual: `POST /api/billing/check/overdue`

### Las tareas no se ejecutan

1. Revisar que el servidor esté en `development` mode
2. Verificar logs: buscar `🔔 [Tarea]`
3. Verificar permiso de lectura en MySQL

### Stock crítico no se detecta

1. Verificar que `min_stock_level` esté configurado en productos
2. Verificar que el inventario actual sea < 30% del mínimo
3. Ejecutar manual: `POST /api/inventory/check/critical-stock`

---

## 📖 Archivos Relacionados

- `backend/routes/notifications.js` - API principal
- `backend/routes/notificationService.js` - Servicios y utilidades
- `backend/routes/orders.js` - Integración de órdenes
- `backend/routes/billing.js` - Integración de facturas
- `backend/routes/inventory.js` - Integración de inventario
- `backend/server.js` - Configuración de tareas programadas
- `frontend/src/components/notifications.jsx` - Componente React
