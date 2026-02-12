# 📊 Notificaciones de Stock Bajo - Documentación Técnica

## 🎯 Visión General

El sistema de notificaciones ahora incluye tres niveles de alerta de inventario:

| Nivel | Nombre        | Código           | Umbral  | Color                | Intervalo |
| ----- | ------------- | ---------------- | ------- | -------------------- | --------- |
| 1     | Stock Crítico | `critical-stock` | < 30%   | 🔴 #FF6B6B           | 30 min    |
| 2     | Stock Bajo    | `low-stock`      | 30-100% | 🟡 #FFD93D / #FFA500 | 45 min    |
| 3     | Stock Normal  | -                | > 100%  | ✅ Verde             | -         |

---

## 📦 Notificaciones de Productos

### Tipos de Productos Soportados

- Productos acabados (panadería, pastelería, etc.)
- Ingredientes principales
- Productos de venta

### Localización de Datos

```sql
-- Tabla base
SELECT p.id, p.name, p.min_stock_level, i.quantity
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.status = 'active'
```

### Estructura de Notificación

```javascript
{
  type: "inventory",
  title: "📦 Producto con stock bajo",
  message: "Pan Integral tiene solo 45 unidades (mínimo: 50)",
  icon: "Package",
  color: "#FFD93D",
  created_at: "2026-02-12T10:30:00.000Z"
}
```

### Ejemplos de Productos Monitoreados

- Pan Blanco: 150 unidades (mín: 100)
- Productos Frescos: 30 unidades (mín: 50)
- Galletas: 200 unidades (mín: 150)

---

## 📋 Notificaciones de Insumos

### Tipos de Insumos Soportados

- Materias primas (harina, levadura, sal)
- Insumos empaquetados
- Aditivos y mejorantes

### Localización de Datos

```sql
-- Tabla base
SELECT s.id, s.name, s.min_stock_level, s.current_quantity
FROM supplies s
WHERE s.active = 1
```

### Estructura de Notificación

```javascript
{
  type: "inventory",
  title: "📋 Insumo con stock bajo",
  message: "Levadura tiene solo 8 unidades (mínimo: 10)",
  icon: "AlertCircle",
  color: "#FFA500",
  created_at: "2026-02-12T10:30:00.000Z"
}
```

### Ejemplos de Insumos Monitoreados

- Harina 0000: 500 kg (mín: 1000 kg)
- Levadura Fresca: 20 unidades (mín: 30)
- Sal Refinada: 50 kg (mín: 100 kg)
- Chocolate: 10 kg (mín: 20 kg)

---

## 🔄 Flujos de Detección

### Flujo 1: Actualización de Inventario

```
PATCH /api/inventory/:id
    ↓
Actualizar cantidad
    ↓
Verificar contra min_stock_level
    ↓
Si cantidad <= min_stock_level → Stock Crítico 🚨
Si 30-100% de min_stock_level → Stock Bajo 🟡
    ↓
Crear notificación
```

### Flujo 2: Tarea Programada (45 min)

```
checkLowStockProducts() ejecuta
    ↓
Buscar: cantidad > (mín * 0.3) AND cantidad <= mín
    ↓
Para cada producto:
    - Verificar notificación reciente (< 6 horas)
    - Si no existe → Crear notificación
    ↓
Registrar en logs
```

### Flujo 3: Tarea Programada (45 min)

```
checkLowStockSupplies() ejecuta
    ↓
Buscar: cantidad > (mín * 0.3) AND cantidad <= mín
    ↓
Para cada insumo:
    - Verificar notificación reciente (< 6 horas)
    - Si no existe → Crear notificación
    ↓
Registrar en logs
```

---

## 📊 Umbrales y Cálculos

### Para Productos

```javascript
const minStockLevel = 100; // mínimo requerido
const currentQuantity = 45;

const stockPercentage = (45 / 100) * 100; // 45%

if (currentQuantity <= minStockLevel * 0.3) {
  // CRÍTICO: < 30 unidades (< 30%)
  notificación = "🚨 STOCK CRÍTICO";
} else if (currentQuantity <= minStockLevel) {
  // BAJO: 30 a 100 unidades (30-100%)
  notificación = "🟡 STOCK BAJO";
} else {
  // NORMAL: > 100 unidades (> 100%)
  notificación = "✅ STOCK NORMAL";
}
```

---

## 🛠️ Configuración Recomendada

### Productos de Alto Movimiento

- Mínimo sugerido: 100-200 unidades
- Frecuencia de compra: 2-3 veces por semana
- Umbral bajo stock: 50-100 unidades

### Productos de Medio Movimiento

- Mínimo sugerido: 50-100 unidades
- Frecuencia de compra: 1 vez por semana
- Umbral bajo stock: 25-50 unidades

### Insumos Críticos (Levadura, Harina)

- Mínimo sugerido: 50-100 bolsas/unidades
- Frecuencia de compra: 2 veces por semana
- Umbral bajo stock: 20-30 unidades

---

## 📡 API para Gestión de Stock

### Endpoints Disponibles

```bash
# Verificar bajo stock (manual)
POST /api/inventory/check/low-stock
POST /api/supplies/check/low-stock

# Verificar stock crítico (manual)
POST /api/inventory/check/critical-stock

# Obtener notificaciones de stock
GET /api/notifications?unreadOnly=true
GET /api/notifications/by-type/inventory
```

---

## 🔍 Monitoreo en Frontend

### Vista de Notificaciones

```
📦 Producto con stock bajo
   Pan Integral tiene solo 45 unidades (mínimo: 50)

📋 Insumo con stock bajo
   Levadura tiene solo 8 unidades (mínimo: 10)

🚨 Stock crítico
   Harina tiene solo 5 unidades (mínimo crítico: 10)
```

### Acciones Disponibles

- ✅ Marcar como leída
- ❌ Eliminar
- 🔔 Ver todas las notificaciones
- 📊 Filtrar por tipo

---

## 📈 Estadísticas y Reportes

### Información Capturada por Notificación

```javascript
{
  id: 42,
  type: "inventory",
  title: "📦 Producto con stock bajo",
  message: "Pan Integral tiene solo 45 unidades (mínimo: 50)",
  is_read: false,
  created_at: "2026-02-12T10:30:00.000Z",
  updated_at: "2026-02-12T10:30:00.000Z"
}
```

### Consultas Útiles

```sql
-- Productos en alerta
SELECT COUNT(*) FROM notifications
WHERE type = 'inventory' AND is_read = FALSE;

-- Insumos con bajo stock
SELECT * FROM notifications
WHERE type = 'inventory'
AND title LIKE '%Insumo%'
AND is_read = FALSE;

-- Historial de 24 horas
SELECT * FROM notifications
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
ORDER BY created_at DESC;
```

---

## ⚙️ Configuración de Intervalos

### Intervalos Actuales

- **7:001 Stock Crítico**: Cada 30 minutos (1,800,000 ms)
- **Bajo Stock (Productos)**: Cada 45 minutos (2,700,000 ms)
- **Bajo Stock (Insumos)**: Cada 45 minutos (2,700,000 ms)

### Para Modificar

**Editor**: `backend/server.js`

```javascript
// Cambiar intervalo (en milisegundos)
setInterval(() => {
  checkLowStockProducts(pool);
}, 2700000); // Cambiar este número
```

**Conversión de Tiempos:**

- 5 minutos = 300,000 ms
- 15 minutos = 900,000 ms
- 30 minutos = 1,800,000 ms
- 45 minutos = 2,700,000 ms
- 1 hora = 3,600,000 ms

---

## 📝 Registros en Logs

El servidor mostrará:

```
🔔 [Tarea] Verificando productos con stock bajo...
✓ Verificados 7 productos con stock bajo
✓ Notificación creada: 📦 Producto con stock bajo

🔔 [Tarea] Verificando insumos con stock bajo...
✓ Verificados 3 insumos con stock bajo
✓ Notificación creada: 📋 Insumo con stock bajo
```

---

## 🔗 Archivos Relacionados

- `backend/routes/notificationService.js` - Lógica de verificación
- `backend/routes/inventory.js` - Integración de productos
- `backend/routes/supplies.js` - Integración de insumos
- `backend/server.js` - Tareas programadas
- `frontend/src/components/notifications.jsx` - UI
