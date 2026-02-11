# Diagnóstico: Órdenes de Producción No Se Cargan

## Pasos para Resolver

### 1. **Verifica la consola del navegador**

- Abre DevTools: `F12`
- Ve a la pestaña "Console"
- Busca mensajes de error rojo
- Mira la pestaña "Network" para ver si la API retorna errores (código HTTP 404 o 500)

### 2. **Verifica que la tabla de production_orders existe en la BD**

Ejecuta en MySQL:

```sql
-- Ver si la tabla existe
SHOW TABLES LIKE 'production_orders';

-- Ver estructura
DESCRIBE production_orders;

-- Ver si hay datos
SELECT COUNT(*) FROM production_orders;
```

### 3. **Verifica que la migración se ejecutó**

La tabla debe existir en el archivo:

- `backend/db/add_supplies_and_production.sql`

Si no existe, ejecuta:

```bash
# En la carpeta backend
node run_migration.js
```

### 4. **Verifica que el backend está respondiendo**

Abre en el navegador:

```
http://localhost:5000/api/production-orders
```

Deberías ver un JSON con las órdenes (puede estar vacío `[]` si no hay datos)

### 5. **Inserta datos de prueba**

Si la tabla existe pero está vacía, inserta un registro:

```sql
INSERT INTO production_orders (order_number, product_id, quantity, responsible_employee_id, status)
VALUES ('PROD-001', 1, 10, 1, 'pendiente');
```

## Mejoras Realizadas

✅ **Mensajes más informativos**: Ahora muestra el producto y cantidad al crear una orden
✅ **Mejor manejo de errores**: Los errores de carga se muestran con detalles
✅ **Mejor feedback de carga**: Muestra mensaje mientras carga

## Checklist Rápido

- [ ] ¿Ves errores en la consola (F12)?
- [ ] ¿La tabla `production_orders` existe en la BD?
- [ ] ¿La API responde en `http://localhost:5000/api/production-orders`?
- [ ] ¿Hay datos en la tabla?
- [ ] ¿El backend está corriendo en puerto 5000?

Si todos son "Sí", recarga la página (Ctrl+F5) para limpiar caché.
