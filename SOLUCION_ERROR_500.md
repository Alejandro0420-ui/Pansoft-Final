# Solución Error 500 - Órdenes (Orders.jsx)

## Problema Detectado

El error 500 que ocurría al cargar los datos en `orders.jsx` fue causado por una **inconsistencia en los nombres de las tablas de la base de datos**.

### Root Cause

El archivo de rutas `backend/routes/supplies.js` estaba intentando acceder a una tabla llamada `supplies`, pero la base de datos tiene la tabla configurada como `insumos`.

```
❌ Antes: SELECT * FROM supplies
✅ Después: SELECT * FROM insumos
```

## Cambios Realizados

### Archivo: [backend/routes/supplies.js](backend/routes/supplies.js)

Se reemplazaron todas las referencias de tabla `supplies` por `insumos`:

1. **GET /supplies** - Cambio en línea 10
   - `FROM supplies` → `FROM insumos`

2. **GET /supplies/:id** - Cambio en línea 22
   - `FROM supplies WHERE id = ?` → `FROM insumos WHERE id = ?`

3. **POST /supplies** - Cambio en línea 37
   - `INSERT INTO supplies (...)` → `INSERT INTO insumos (...)`
   - Actualización de columnas (removidas: `sku`, `category`, `price`, `min_stock_level`)

4. **PUT /supplies/:id** - Cambio en línea 69
   - `UPDATE supplies SET ...` → `UPDATE insumos SET ...`

5. **PATCH /supplies/:id/stock** - Cambio en línea 96
   - `UPDATE supplies SET stock_quantity ...` → `UPDATE insumos SET stock_quantity ...`

6. **DELETE /supplies/:id** - Cambio en línea 111
   - `UPDATE supplies SET is_active = false` → `UPDATE insumos SET status = 'inactive'`

7. **PATCH /supplies/:id/toggle-status** - Cambio en línea 127
   - `UPDATE supplies SET is_active = false` → `UPDATE insumos SET status = 'inactive'`

8. **GET /supplies/recipes/:productId** - Cambio en línea 150
   - `FROM supplies s` → `FROM insumos i`
   - Actualizados alias de columnas

9. **POST /supplies/recipes/create** - Cambio en línea 167
   - `supply_id` → `insumo_id`

## Estado de la Base de Datos

### Estructura de tabla `insumos`

```sql
CREATE TABLE IF NOT EXISTS insumos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  unit VARCHAR(50) DEFAULT 'kg',
  stock_quantity DECIMAL(10, 2) DEFAULT 0,
  min_stock_level DECIMAL(10, 2) DEFAULT 10,
  unit_price DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Cómo Testear la Solución

1. **Reiniciar el servidor backend:**

   ```bash
   cd backend
   npm start
   ```

2. **Abrir la aplicación frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Navegar a la sección de Órdenes:**
   - La página debe cargar sin error 500
   - Se mostrarán las órdenes, productos, insumos, empleados y clientes correctamente

4. **Verificar en la consola del navegador:**
   - No debe haber mensajes de error sobre status 500
   - El error anterior: "Error loading data: AxiosError: Request failed with status code 500" debe desaparecer

## Archivos Modificados

- [backend/routes/supplies.js](backend/routes/supplies.js) ✅ 9 cambios realizados

## Próximos Pasos (Opcional)

Para evitar futuros problemas de inconsistencia:

1. Documentar claramente la estructura de tablas
2. Usar migraciones de base de datos
3. Validar que los nombres de rutas (`/supplies`) coincidan con los nombres de tablas (`insumos`)
