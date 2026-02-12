# 📬 Sistema de Notificaciones

## Descripción General

El sistema de notificaciones es un módulo completo que permite:
- **Crear notificaciones** automáticas en eventos importantes
- **Visualizar notificaciones** en el frontend
- **Marcar como leídas** y eliminar notificaciones
- **Filtrar notificaciones** por tipo y estado

---

## 🏗️ Arquitectura

### Backend (`backend/routes/notifications.js`)
- **Tabla MySQL**: `notifications` con campos:
  - `id`: Identificador único
  - `type`: Tipo de notificación (inventory, order, success, warning, info)
  - `title`: Título de la notificación
  - `message`: Mensaje principal
  - `icon`: Nombre del icono
  - `color`: Color hexadecimal
  - `is_read`: Estado de lectura
  - `user_id`: ID del usuario (opcional)
  - `created_at` / `updated_at`: Marcas de tiempo

### Frontend (`frontend/src/components/notifications.jsx`)
- Componente React funcional
- Cargas automáticas cada 10 segundos
- Interfaz con filtros y acciones

---

## 📡 API Endpoints

### Obtener notificaciones
```bash
GET /api/notifications
GET /api/notifications?unreadOnly=true    # Solo sin leer
GET /api/notifications?limit=20&offset=0  # Paginación
```

**Respuesta:**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "inventory",
      "title": "⚠️ Bajo inventario",
      "message": "Harina tiene solo 5 unidades",
      "is_read": false,
      "created_at": "2026-02-11T10:30:00.000Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

### Obtener notificaciones por tipo
```bash
GET /api/notifications/by-type/inventory
GET /api/notifications/by-type/order
```

### Contar sin leer
```bash
GET /api/notifications/unread/count
```

**Respuesta:**
```json
{
  "unreadCount": 5
}
```

### Marcar como leída
```bash
PATCH /api/notifications/:id/read
```

### Marcar todas como leídas
```bash
PATCH /api/notifications/read/all
```

### Eliminar notificación
```bash
DELETE /api/notifications/:id
```

### Eliminar todas las leídas
```bash
DELETE /api/notifications/read/all
```

---

## 🛠️ Utilidades de Servicio

Archivo: `backend/routes/notificationService.js`

### Ejemplos de uso:

```javascript
import { createNotification, notificationService } from "./notificationService.js";

// Notificación de bajo inventario
const notification = notificationService.lowStock("Harina", 5, 10);
await createNotification(pool, notification);

// Notificación de orden completada
const notification = notificationService.orderCompleted(123, "Juan Pérez");
await createNotification(pool, notification);

// Crear notificación personalizada
const notification = notificationService.custom(
  "custom",
  "Mi título",
  "Mi mensaje",
  "Bell",
  "#FF6B6B"
);
await createNotification(pool, notification);
```

### Tipos de notificación disponibles:
- `lowStock(productName, quantity, minQuantity)`
- `orderCompleted(orderId, customerName)`
- `orderPending(orderId, customerName)`
- `orderCancelled(orderId, reason)`
- `paymentReceived(orderId, amount)`
- `outOfStock(productName)`
- `newSupplier(supplierName)`
- `productionStatusChange(orderId, status)`
- `employeeAdded(employeeName)`
- `error(title, message)`
- `custom(type, title, message, icon, color)`

---

## 🔗 Integración en Módulos Existentes

### Ejemplo: Crear notificación al registrar una orden

**Archivo**: `backend/routes/orders.js`

```javascript
import { createNotification, notificationService } from "./notificationService.js";

router.post("/", async (req, res) => {
  try {
    // ... crear orden ...
    
    const orderId = result.insertId;
    const [customer] = await pool.query(
      "SELECT name FROM customers WHERE id = ?",
      [req.body.customer_id]
    );
    
    // Crear notificación
    const notification = notificationService.orderPending(
      orderId,
      customer[0].name
    );
    await createNotification(pool, notification);
    
    res.json({ success: true, orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Ejemplo: Verificación automática de bajo inventario

**Archivo**: `backend/server.js`

```javascript
import { checkLowStockNotifications } from "./routes/notificationService.js";

// Dentro de startServer()
// Verificar bajo inventario cada hora
setInterval(() => checkLowStockNotifications(pool), 3600000);
```

---

## 🎨 Tipos de Notificaciones y Colores

| Tipo | Color | Icono | Uso |
|------|-------|-------|-----|
| inventory | #FF6B6B | AlertCircle | Bajo stock |
| order | #4ECDC4 | ShoppingCart | Cambios en órdenes |
| success | #51CF66 | CheckCircle | Acciones completadas |
| warning | #FFD93D | AlertTriangle | Advertencias |
| info | #6C5CE7 | Info | Información general |

---

## 💻 Frontend - Características

### Funcionalidades
- ✅ Listar todas las notificaciones
- ✅ Filtrar por leídas/sin leer
- ✅ Marcar como leída/todas como leídas
- ✅ Eliminar notificación/leídas
- ✅ Actualización automática cada 10 segundos
- ✅ Contador de sin leer
- ✅ Iconos y colores personalizados
- ✅ Formato de fecha/hora locales

### Props
No recibe props, obtiene datos directamente de la API

### Estados
- `notifications`: Lista de notificaciones
- `loading`: Estado de carga
- `filter`: Filtro actual (all/unread)
- `unreadCount`: Contador de sin leer

---

## 🚀 Próximas Mejoras

- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Notificaciones por email
- [ ] Notificaciones push
- [ ] Sistema de preferencias de notificación
- [ ] Plantillas personalizables
- [ ] Historial de notificaciones con búsqueda avanzada

---

## 📝 Notas de Desarrollo

1. **Tabla automática**: Se crea automáticamente en la primera ejecución
2. **Performance**: Se limpian notificaciones automáticamente cada cierto tiempo
3. **Sin autenticación requerida**: Actualmente cualquiera puede crear notificaciones
4. **UTF-8**: Soporta caracteres especiales y emojis

---

## Archivos Relacionados

- 📄 `backend/routes/notifications.js` - Rutas y lógica API
- 📄 `backend/routes/notificationService.js` - Utilidades y servicios
- 📄 `frontend/src/components/notifications.jsx` - Componente React
- 📄 `backend/NOTIFICACIONES_GUIA_INTEGRACION.js` - Ejemplos de integración
