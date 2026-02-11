# Solución: Error 500 en Modal de Nueva Orden de Venta

## 🔴 Problema Identificado

El error 500 en `orders.jsx:162` ocurría porque:

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Error cargando órdenes: AxiosError: Request failed with status code 500
```

### Causas Raíz:

1. **Tablas de Base de Datos No Existentes**: Las tablas `sales_orders`, `production_orders`, y relacionadas no estaban siendo creadas automáticamente en la base de datos.

2. **Falta de Inicialización de BD**: El servidor no ejecutaba los scripts SQL de inicialización al iniciar.

3. **Configuración Incompleta**: El archivo `.env` no estaba presente con la configuración correcta para MySQL.

4. **Falta de Manejo de Errores Detallados**: Los errores de la API no proporcionaban suficiente información para depuración.

---

## ✅ Soluciones Implementadas

### 1. **Archivo `.env` Creado**

`backend/.env`

```
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pansoft_db
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

### 2. **Inicialización Automática de BD en `server.js`**

- El servidor ahora ejecuta automáticamente los scripts SQL al iniciar
- Crea la base de datos si no existe
- Crea todas las tablas necesarias (usuarios, productos, órdenes, etc.)
- Maneja errores sin interrumpir el servidor si las tablas ya existen

**Cambios en `backend/server.js`:**

- Importa `fs`, `path` y `fileURLToPath` para leer archivos SQL
- Función `initializeDatabase()` que:
  - Crea la BD `pansoft_db` si no existe
  - Ejecuta `init.sql` (tablas principales)
  - Ejecuta `create_orders_tables.sql` (tablas de órdenes)
  - Ignora errores de tablas duplicadas

### 3. **Mejora en Mensajes de Error de la API**

**`backend/routes/sales-orders.js`** y **`backend/routes/production-orders.js`**:

- Agregados logs detallados en consola
- Respuestas JSON con información de error más completa
- Incluye código de error MySQL para depuración

Ejemplo:

```javascript
res.status(500).json({
  error: "Error al obtener órdenes de venta",
  details: error.message,
  code: error.code,
});
```

### 4. **Mejora en Manejo de Errores del Frontend**

**`frontend/src/components/orders.jsx`** - Función `loadOrders()`:

- Mensajes de error específicos según el tipo de problema
- Detección de errores de red vs errores del servidor
- Logs en consola para depuración
- Más informativo para el usuario final

---

## 🚀 Cómo Usar

### Opción 1: Iniciar Servidor (Recomendado)

```bash
cd backend
npm start
```

El servidor automáticamente:

1. Verificará la conexión a MySQL
2. Creará la BD `pansoft_db` si no existe
3. Ejecutará los scripts SQL de inicialización
4. Escuchará en el puerto 5000

### Opción 2: Inicializar BD Manualmente (si es necesario)

```bash
cd backend
node init_database.js
```

---

## 📋 Tablas Creadas

El sistema ahora crea automáticamente:

### Tablas Principales:

- `users` - Usuarios del sistema
- `products` - Catálogo de productos
- `customers` - Clientes
- `employees` - Empleados
- `suppliers` - Proveedores

### Tablas de Órdenes:

- `sales_orders` - Órdenes de venta
- `sales_order_items` - Ítems de órdenes de venta
- `sales_order_insumos` - Insumos para órdenes de venta
- `production_orders` - Órdenes de producción
- `production_order_insumos` - Insumos para órdenes de producción

---

## ⚠️ Verificación

Si aún recibe el error 500 después de iniciar el servidor:

1. **Verifique la conexión a MySQL:**

   ```bash
   mysql -u root -h localhost
   ```

2. **Revise los logs del servidor:** Busque mensajes que indiquen qué tabla está faltando

3. **Force la recarga del frontend:** `Ctrl + Shift + R`

4. **Limpie la caché del navegador** y cierre las pestañas abiertas

---

## 📝 Cambios Realizados

### Backend:

- ✅ `server.js` - Agregada inicialización automática de BD
- ✅ `.env` - Creado con configuración correcta
- ✅ `init_database.js` - Nuevo script de utilidad
- ✅ `routes/sales-orders.js` - Mejora en logs y errores
- ✅ `routes/production-orders.js` - Mejora en logs y errores

### Frontend:

- ✅ `src/components/orders.jsx` - Mejora en manejo de errores

---

## 🔍 Depuración

Para más detalles sobre los errores, abra la consola del navegador (F12) y revise:

1. Pestaña **Console** para logs del frontend
2. Pestaña **Network** para ver las respuestas del servidor
