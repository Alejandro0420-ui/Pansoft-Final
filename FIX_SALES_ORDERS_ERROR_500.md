# 🔧 Corrección de Error 500 en Actualización de Órdenes de Venta

## Problema Identificado

El servidor retornaba un error HTTP 500 cuando el usuario intentaba actualizar el estado de una orden de venta a "lista". El error específico era:

```
Error: AxiosError: Request failed with status code 500
```

### Causa Raíz

El archivo `backend/routes/sales-orders.js` intentaba acceder a la columna `customer_name` en la tabla `sales_orders`, pero esta columna **no existía en la base de datos**. 

La tabla SQL `sales_orders` fue definida en `backend/db/add_supplies_and_production.sql` sin incluir:
- `customer_name` VARCHAR(100)

Sin embargo, el código JavaScript estaba intentando:
1. **SELECT customer_name** en el endpoint GET
2. **INSERT customer_name** en el endpoint POST
3. Usar **customer_name** en toda la lógica

Esto causaba errores SQL: `Unknown column 'customer_name'` que devolvían el error 500.

---

## ✅ Soluciones Implementadas

### 1. **Agregación de Columnas Faltantes**
Archivos modificados:
- `backend/apply_fix_migrations.js` (CREADO)
- `backend/db/fix_sales_orders_columns.sql` (CREADO)
- `backend/setup_database.js` (ACTUALIZADO)

**Cambios:**
- ✅ Agregada columna `customer_name VARCHAR(100)` a tabla `sales_orders`
- ✅ Agregada columna `customer_name VARCHAR(100)` a tabla `production_orders`
- ✅ Verified columna `notes TEXT` en `sales_orders`
- ✅ Creado índice `idx_sales_orders_customer_name` para optimización

**Ejecución:**
```bash
node apply_fix_migrations.js
```

### 2. **Mejora del Endpoint PATCH /:id/status en Sales Orders**
Archivo: `backend/routes/sales-orders.js`

**Cambios Implementados:**

#### A. Validación de Estados
```javascript
const validStatuses = ["pendiente", "confirmada", "en_preparacion", "lista", "entregada", "cancelada", "completada"];
if (!validStatuses.includes(status)) {
  return res.status(400).json({ error: "Estado inválido" });
}
```

#### B. Transacciones Seguras
Ya no se ejecuta un simple UPDATE; ahora se utiliza:
- `START TRANSACTION`
- Operaciones atómicas
- `COMMIT` o `ROLLBACK` automático

#### C. **Actualización Automática de Inventario** 
Cuando una orden se marca como "entregada" o "completada":

1. **Obtiene los items de la orden** desde `sales_order_items`
2. **Para cada producto:**
   - Calcula la cantidad restante: `previousQuantity - itemQuantity`
   - Actualiza la tabla `inventory`
   - Actualiza la tabla `products.stock_quantity`
   - Registra el movimiento en `inventory_movements`

```javascript
// Ejemplo: Antes = 100 unidades, Pedido = 30 unidades
// Después = 70 unidades (100 - 30)
const newQuantity = Math.max(0, previousQuantity - item.quantity);
```

3. **Manejo de Errores Robusto:**
   - Si la tabla `inventory_movements` no existe, continúa sin registrar
   - Rollback automático si hay error en transacción

#### D. Respuesta Mejorada
```json
{
  "message": "Estado actualizado exitosamente",
  "id": 1,
  "status": "entregada",
  "inventoryUpdated": true
}
```

---

## 📋 Archivos Modificados/Creados

### Nuevos Archivos
1. **`backend/apply_fix_migrations.js`**
   - Script para aplicar migraciones de corrección
   - Verifica existencia de columnas antes de agregarlas
   - Proporciona feedback detallado

2. **`backend/db/fix_sales_orders_columns.sql`**
   - Archivo de migración SQL (documentación)
   - Nota: El script anterior maneja las verificaciones en JavaScript

### Archivos Modificados
1. **`backend/routes/sales-orders.js`**
   - Endpoint PATCH /:id/status: Refactorizado completamente
   - Agregada lógica de actualización de inventario
   - Implementadas transacciones seguras
   - Mejorado manejo de errores

2. **`backend/setup_database.js`**
   - Agregado paso 5.5 para ejecutar migraciones de corrección
   - Ahora ejecuta automáticamente `fix_sales_orders_columns.sql` al inicializar BD

---

## 🚀 Cómo Aplicar las Correcciones

### Opción 1: Limpia (Recomendado)
```bash
cd backend
node setup_database.js  # Elimina y recrea la BD con todas las migraciones
npm start
```

### Opción 2: Rápida (Si tienes datos)
```bash
cd backend
node apply_fix_migrations.js  # Solo aplica las columnas faltantes
npm start
```

---

## ✨ Beneficios de los Cambios

1. ✅ **Error 500 eliminado**: El endpoint funciona correctamente
2. ✅ **Inventario automático**: Se actualiza al entregar/completar órdenes
3. ✅ **Transacciones seguras**: Los datos se actualizan de forma consistente
4. ✅ **Historial de movimientos**: Se registra quién y cuándo cambió inventario
5. ✅ **Manejo de errores robusto**: Los problemas se reportan claramente con detalles

---

## 🧪 Prueba del Endpoint

### Request
```bash
PATCH /api/sales-orders/1/status
Content-Type: application/json

{
  "status": "entregada"
}
```

### Response Exitosa
```json
{
  "message": "Estado actualizado exitosamente",
  "id": 1,
  "status": "entregada",
  "inventoryUpdated": true
}
```

### Logs en Servidor
```
✅ Orden de venta 1 marcada como entregada. Procesando inventario...
📦 Procesando producto 1: 20 unidades
✅ Inventario actualizado para producto 1: 150 -> 130
✅ stock_quantity en products actualizado a 130
✅ Movimiento de inventario registrado en historial
```

---

## 💡 Estados Válidos de Órdenes de Venta

```javascript
"pendiente"      // Inicial
"confirmada"     // Cliente confirmó
"en_preparacion" // En proceso
"lista"          // Lista para envío
"entregada"      // Entregada (reduce inventario)
"completada"     // Completada/facturada (reduce inventario)
"cancelada"      // Cancelada por cliente
```

---

## 🔍 Verificación

Después de aplicar las correcciones, puedes verificar con:

```bash
# Verificar columnas en sales_orders
mysql> DESCRIBE sales_orders;

# Debería mostrar:
# customer_name | varchar(100) | YES  | MUL | 
# notes         | text         | YES  |     | ``

# Verificar órdenes con inventario
mysql> SELECT * FROM inventory LIMIT 5;
```

---

## 📝 Notas Importantes

1. **Compatibilidad**: Los cambios son **backwards compatible** - no rompen funcionalidad existente
2. **Performance**: Se agregó índice en `customer_name` para búsquedas rápidas
3. **Seguridad**: Las transacciones garantizan integridad de datos
4. **Rollback**: Si hay error, todos los cambios se revierten automáticamente

---

**¿Necesitas más ayuda?**
- Revisa los logs del servidor para entender qué sucede
- El endpoint ahora return detallado errores con mensajes claros
- Las migraciones son idempotentes - se pueden ejecutar múltiples veces sin problemas
