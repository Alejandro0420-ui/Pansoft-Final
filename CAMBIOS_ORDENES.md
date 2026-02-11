# Cambios Realizados - Órdenes de Venta y Producción

## ✅ Cambios Completados

### 1. **Clientes Manuales en Órdenes de Venta**

- ✅ Campo de cliente cambió de selector a **entrada de texto manual**
- ✅ Ya no necesita tabla de clientes
- ✅ Base de datos actualizada para guardar `customer_name`
- ✅ Backend actualizado para aceptar nombre del cliente

### 2. **Precios en Pesos (COP)**

- ✅ Todos los productos muestran precios en **$ COP**
- ✅ Órdenes de venta muestran subtotales por producto
- ✅ Órdenes de producción muestran costos de insumos en pesos
- ✅ Formato: 1.234.567,89 (estándar colombiano)

### 3. **Órdenes de Producción - Arregladas**

- ✅ Mejor manejo de errores (ahora muestra mensaje del error)
- ✅ Validación mejorada del payload
- ✅ Logs de debug en consola para troubleshooting
- ✅ Ahora soporta insumos opcionales

## 📋 Pasos para Aplicar los Cambios

### Paso 1: Ejecutar la Migración de BD ✅ (YA HECHO)

```bash
cd backend
node migrate_sales_orders.js
```

La migración agregó:

- Columna `customer_name` a tabla `sales_orders`
- Hizo `customer_id` nullable
- Creó índice para búsquedas rápidas

### Paso 2: Reiniciar el Backend

```bash
# Si el backend está corriendo, presiona Ctrl+C y luego:
cd backend
npm start
# O si usas: node server.js
```

### Paso 3: Limpiar Caché del Frontend

En el navegador:

1. Abre DevTools con F12
2. Ve a la pestaña "Network"
3. Marca "Disable cache"
4. Recarga la página (Ctrl+F5 o Cmd+Shift+R)

## 🧪 Prueba Rápida

### Crear Orden de Venta

1. Ve a la sección "Órdenes de Venta/Producción"
2. Haz clic en "Nueva Orden de Venta"
3. **Ingresa nombre del cliente** (ej: "Juan Pérez")
4. Selecciona productos (verás precios en pesos)
5. Ingresa cantidades
6. Haz clic en "Crear Orden"
7. ✅ Verás: "Orden VNT-001 creada - Cliente: Juan Pérez, 2 producto(s)"

### Crear Orden de Producción

1. Haz clic en "Nueva Orden de Producción"
2. Selecciona producto
3. Ingresa cantidad
4. Selecciona responsable
5. **(Opcional)** Agrega insumos con costos
6. Haz clic en "Crear Orden"
7. ✅ Verás: "Orden PROD-001 creada - Producto: [nombre], Cantidad: [num]"

## 📊 Cambios en la Base de Datos

```sql
-- Tabla sales_orders ahora tiene:
ALTER TABLE sales_orders
ADD COLUMN customer_name VARCHAR(100),
MODIFY customer_id INT NULL;

-- Índices agregados:
CREATE INDEX idx_sales_orders_customer_name ON sales_orders(customer_name);
```

## 🔧 Archivos Modificados

### Frontend

- `frontend/src/components/orders.jsx` - Cambios principales:
  - Cliente input texto en lugar de selector
  - Precios formateados en pesos
  - Mejor manejo de errores en órdenes de producción
  - Subtotales calculados

### Backend

- `backend/routes/sales-orders.js` - Cambios:
  - Acepta `customer_name` en POST
  - GET retorna customer_name del cliente o del campo manual
  - PUT actualiza customer_name
- `backend/migrate_sales_orders.js` (nuevo) - Script de migración

### Base de Datos

- `backend/db/update_sales_orders_manual_customer.sql` (nuevo) - Script SQL alternativo

## ⚠️ Si Algo No Funciona

### Las órdenes de venta no guardan

1. Verifica que el backend esté corriendo: http://localhost:5000/api/health
2. Abre F12 → Network tab
3. Crea una orden y mira el error en la petición POST a `/api/sales-orders`

### Las órdenes de producción fallan

1. Verifica la consola del navegador (F12 → Console)
2. Mira los logs en el terminal del backend
3. Asegúrate que:
   - Exista la tabla `production_orders`
   - El producto exista en tabla `products`
   - El empleado exista en tabla `employees`

### Los precios no se muestran

1. Verifica que los productos tengan field `price` en la BD
2. Recarga caché del navegador (Ctrl+F5)
3. Si aún no funciona, revisa que `productsAPI.getAll()` retorne precios

## 🎯 Próximas Mejoras (Opcional)

- [ ] Agregar búsqueda de órdenes por cliente
- [ ] Generar PDF de órdenes
- [ ] Integraciones de pago
- [ ] Historial completo de cambios en órdenes
