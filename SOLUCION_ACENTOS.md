# 🎯 Solución Completa: Arreglar Problema de Acentos (?? en lugar de tildes)

## Problema Identificado

Los acentos y caracteres especiales se ven como `??` en la base de datos. Esto ocurre cuando:

- La conexión MySQL no usa UTF-8
- Las tablas no especifican charset UTF-8
- Los headers HTTP no especifican UTF-8

## ✅ Cambios Realizados Automáticamente

### 1. **Backend Server (server.js)**

✓ Agregado `charset: "utf8mb4"` al pool de conexiones MySQL
✓ Agregado middleware para headers `Content-Type: application/json; charset=utf-8`

### 2. **Archivos SQL Actualizados**

✓ `backend/db/init.sql` - Todas las tablas con CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
✓ `backend/db/mysql_init.sql` - Base de datos y todas las tablas con UTF-8
✓ `backend/db/add_supplies_and_production.sql` - Tablas de producción y ventas con UTF-8

### 3. **Conexiones Directas Actualizadas**

✓ `backend/migrate_sales_orders.js`
✓ `backend/check_db.js`
✓ `backend/add_category_migration.js`
✓ `backend/run_migration.js`

---

## 🚀 Pasos para Implementar la Solución

### OPCIÓN A: Empezar de Cero (Recomendado)

Si puedes empezar con una base de datos nueva, sigue estos pasos:

#### 1. Eliminar Base de Datos Anterior

```powershell
mysql -u root -p
```

```sql
DROP DATABASE pansoft_db;
EXIT
```

#### 2. Crear Nueva Base de Datos con UTF-8 Correcto

```powershell
mysql -u root -p < "C:\Users\aleja\OneDrive\Desktop\Pansoft Final\backend\db\mysql_init.sql"
```

#### 3. Insertar Datos de Prueba

```powershell
mysql -u root -p pansoft_db < "C:\Users\aleja\OneDrive\Desktop\Pansoft Final\backend\db\mysql_seed.sql"
```

#### 4. Ejecutar Migraciones Adicionales

```powershell
cd "C:\Users\aleja\OneDrive\Desktop\Pansoft Final\backend"
node run_migration.js
mysql -u root -p pansoft_db < "db\add_supplies_and_production.sql"
```

#### 5. Reiniciar Backend

```powershell
npm start
```

---

### OPCIÓN B: Convertir Base de Datos Existente

Si tienes datos importantes y quieres conservarlos:

#### 1. Hacer Backup de la Base de Datos Actual

```powershell
mysqldump -u root -p pansoft_db > pansoft_db_backup.sql
```

#### 2. Convertir Charset de Tablas Existentes

Abre MySQL y ejecuta:

```sql
USE pansoft_db;

-- Para cada tabla existente:
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE suppliers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE customers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE employees CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE invoices CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE sales_orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE production_orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Repetir para todas las tablas que tengas...
```

#### 3. Cambiar Charset de Base de Datos

```sql
ALTER DATABASE pansoft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 4. Ejecutar Migraciones Faltantes

```powershell
cd "C:\Users\aleja\OneDrive\Desktop\Pansoft Final\backend"
node run_migration.js
mysql -u root -p pansoft_db < "db\add_supplies_and_production.sql"
```

---

## 🔍 Verificar que la Solución Funciona

### 1. Verificar Charset de la Base de Datos

```sql
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'pansoft_db';
```

**Resultado esperado:**

```
DEFAULT_CHARACTER_SET_NAME: utf8mb4
DEFAULT_COLLATION_NAME: utf8mb4_unicode_ci
```

### 2. Verificar Charset de Tablas

```sql
SELECT TABLE_NAME, TABLE_COLLATION
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'pansoft_db';
```

**Resultado esperado:**

```
Todas las tablas deben tener: utf8mb4_unicode_ci
```

### 3. Insertar Datos de Prueba con Acentos

```sql
USE pansoft_db;

-- Probar con una tabla
INSERT INTO customers (name, email, phone, city, country)
VALUES ('José García', 'jose@example.com', '123456789', 'México', 'México');

-- Verificar que se guardó correctamente
SELECT * FROM customers WHERE name LIKE '%José%';
```

### 4. Probar desde la API

```bash
# En PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/api/customers" -Method GET | Format-List

# O en curl
curl http://localhost:5000/api/customers
```

**Resultado esperado:**

- Los acentos deben verse correctamente en la salida JSON
- No deben aparecer `??` en lugar de acentos

---

## 📝 Archivo .env a Verificar

Asegúrate de que `backend/.env` contenga:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pansoft_db
PORT=5000
```

---

## ⚠️ Solución de Problemas

### Los acentos siguen mostrando ?? después de los cambios

**Causa:** Datos anteriores fueron guardados con encoding incorrecto

**Solución:**

1. Hacer backup
2. Dropdown database
3. Crear nueva con migraciones limpias (OPCIÓN A)

### Error: "charset utf8mb4 not recognized"

**Causa:** Versión antigua de MySQL

**Solución:**

- Actualizar MySQL a versión 5.5.3 o superior
- O cambiar `utf8mb4` por `utf8` (aunque no es recomendado)

```sql
ALTER TABLE tablename CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;
```

### Error: "Cannot convert column"

**Causa:** Datos corruptos en columnas existentes

**Solución:**

- Hacer backup
- Recrear tabla vacía
- Migrar datos válidos solamente

---

## 📋 Checklist de Verificación

- [ ] Backend actualizado con charset en server.js
- [ ] MySQL init script actualizado con CHARACTER SET utf8mb4
- [ ] Todas las tablas creadas con utf8mb4
- [ ] Conexiones JavaScript incluyen charset: "utf8mb4"
- [ ] Base de datos recreada o convertida a utf8mb4
- [ ] Frontend index.html tiene `<meta charset="UTF-8" />`
- [ ] Backend corriendo y respondiendo con acentos correctos
- [ ] Datos de prueba insertados y viendo correctamente

---

## 🎉 Resultado

Una vez completados estos pasos:

- ✅ Los acentos se verán correctamente en toda la aplicación
- ✅ No más `??` en lugar de tildes
- ✅ Soporte completo para caracteres españoles: á, é, í, ó, ú, ñ, ü
- ✅ Soporte para otros idiomas con caracteres especiales

---

**Fecha de creación:** 2026-02-10
**Proyecto:** Pansoft - Sistema de Gestión
