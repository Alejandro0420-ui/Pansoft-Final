# 🔧 Guía para Cargar Datos en la Base de Datos

## Problema Identificado

Los reportes estaban vacíos porque la base de datos no tenía datos de prueba insertados. Se ha creado un script para cargar datos automáticamente.

## ✅ Solución: Ejecutar Seeding

### Opción 1: Usar el script Node.js (Recomendado)

```bash
# 1. Abre PowerShell/Terminal en la carpeta backend
cd "c:\Users\aleja\OneDrive\Desktop\Pansoft Final\backend"

# 2. Asegúrate de que MySQL está corriendo
# Puedes verificar accediendo a MySQL: mysql -u root -p

# 3. Ejecuta el seeding con Node.js
node seed_database.js
```

**Resultado esperado:**

```
🌱 Iniciando proceso de seeding...

Ejecutando: USE pansoft_db...
Ejecutando: DELETE FROM sales_orders...
...
✅ Seeding completado exitosamente!

📊 Resumen de datos insertados:
   Productos: 10
   Clientes: 5
   Empleados: 6
   Órdenes de Venta: 5
   Órdenes de Producción: 6
   Insumos: 10
```

### Opción 2: Ejecutar SQL directamente en MySQL

```bash
# 1. Abre comando MySQL
mysql -u root -Pansoft@2026 pansoft_db

# 2. Ejecuta el script SQL
SOURCE "backend/db/seed_data_modern.sql";

# 3. Verifica los datos
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM sales_orders;
SELECT COUNT(*) FROM production_orders;
```

### Opción 3: Usar MySQL Workbench o DBeaver

1. Abre tu cliente SQL favorito (Workbench, DBeaver, etc.)
2. Conecta a la BD: `pansoft_db` (localhost, user: root, password: Pansoft@2026)
3. Abre el archivo: `backend/db/seed_data_modern.sql`
4. Ejecuta el script

## 📊 Qué Datos se Insertan

### Productos (10 items)

- Pan Francés, Pan Integral, Croissants
- Torta de Chocolate, Donas Glaseadas
- Galletas, Muffins, Empanadas
- Brownie, Pan de Queso

### Clientes (5 empresas)

- Panadería La Mansión
- Supermercado El Centro
- Cafetería Premium
- Restaurante Casa Luis
- Tienda Gourmet

### Empleados (6 personal)

- 2 Panaderos (Juan, María)
- 1 Pastelero (Carlos)
- 1 Vendedor (Ana)
- 1 Gerente (Pedro)
- 1 Contador (Sofia)

### Órdenes de Venta (5 órdenes)

- SO-2024-0001 a SO-2024-0005
- Con diferentes estados: completada, pendiente
- Con items asociados y totales

### Órdenes de Producción (6 órdenes)

- PO-2024-0001 a PO-2024-0006
- Asignadas a empleados
- Con estados: completada, pendiente

### Insumos/Supplies (10 items)

- Harina, Azúcar, Levadura
- Mantequilla, Huevos, Chocolate
- Sal, Vainilla, Arándanos, Aceite

## 🔍 Verificar que Funcionó

Después de ejecutar el seeding:

1. **Abre el navegador:**

   ```
   http://localhost:5173
   ```

2. **Ve a Reportes en el menú lateral**

3. **Verifica que ves:**
   - ✅ Dashboard con 4 KPIs (Ventas, Órdenes, Productos, Clientes)
   - ✅ Gráfico de Ventas diarias
   - ✅ Tabla de Órdenes de Venta con datos
   - ✅ Tabla de Órdenes de Producción con datos
   - ✅ Tabla de Productos con Stock
   - ✅ Tabla de Empleados
   - ✅ Tabla de Clientes
   - ✅ Tabla de Inventario

## 🐛 Troubleshooting

### Error: "Connect ECONNREFUSED"

- MySQL no está corriendo
- **Solución:** Inicia MySQL: `mysql -u root -pPansoft@2026`

### Error: "Access denied for user 'root'"

- Contraseña incorrecta
- **Solución:** Verifica .env tiene: `DB_PASSWORD=Pansoft@2026`

### Error: "Database 'pansoft_db' doesn't exist"

- BD no está creada
- **Solución:** Ejecuta `backend/db/init.sql` y `backend/db/create_orders_tables.sql` primero

### El seeding tarda mucho

- Es normal, son muchos datos
- Espera a que termine (máximo 30 segundos)

## 🔄 Reiniciar from Zero

Si necesitas limpiar todo y empezar de nuevo:

```bash
# 1. Eliminar BD
mysql -u root -pPansoft@2026 -e "DROP DATABASE pansoft_db;"

# 2. Crear BD nuevamente
mysql -u root -pPansoft@2026 < backend/db/init.sql
mysql -u root -pPansoft@2026 < backend/db/create_orders_tables.sql

# 3. Insertar datos de prueba
node backend/seed_database.js
```

## ✨ Después del Seeding

Una vez que tengas datos:

1. Los reportes mostrarán datos reales
2. Puedes filtrar por fecha y estado
3. Puedes descargar CSV
4. Los KPIs se actualizan automáticamente
5. El gráfico muestra tendencias

## 📝 Archivo del Scripts

- **Script SQL:** `backend/db/seed_data_modern.sql`
- **Script Node:** `backend/seed_database.js`

¡Listo! Tus reportes deberían funcionar perfectamente ahora. 🚀
