# Solución: Historial de Movimientos de Inventario

## Problema

El sistema de inventario no registraba el historial de movimientos. Solo actualizaba la cantidad sin dejar constancia de:

- Cantidad anterior
- Cantidad nueva
- Tipo de movimiento
- Quién hizo el cambio
- Cuándo se hizo
- Motivo del cambio

## Solución Implementada

### 1. **Nuevas Tablas de Base de Datos**

#### Tabla: `inventory_movements`

```sql
CREATE TABLE inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución'),
  quantity_change INT,
  previous_quantity INT,
  new_quantity INT,
  reason VARCHAR(255),
  notes LONGTEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

#### Tabla: `supplies_movements`

```sql
CREATE TABLE supplies_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supply_id INT NOT NULL,
  movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución'),
  quantity_change INT,
  previous_quantity INT,
  new_quantity INT,
  reason VARCHAR(255),
  notes LONGTEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supply_id) REFERENCES supplies(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### 2. **Nuevos Endpoints API**

#### GET `/api/inventory/:productId/history`

Obtiene el historial de movimientos de un producto específico.

**Parámetros:**

- `limit` (opcional): cantidad de registros a retornar (default: 50)

**Respuesta:**

```json
[
  {
    "id": 1,
    "product_id": 5,
    "product_name": "Producto A",
    "sku": "SKU001",
    "movement_type": "entrada",
    "quantity_change": 50,
    "previous_quantity": 100,
    "new_quantity": 150,
    "reason": "Compra a proveedor",
    "notes": "Orden PO-2024-001",
    "user_name": "Juan Pérez",
    "created_at": "2024-02-11T10:30:00Z"
  }
]
```

#### GET `/api/inventory/history/all/movements`

Obtiene todos los movimientos de todos los productos.

**Parámetros:**

- `limit` (opcional): registros por página (default: 100)
- `offset` (opcional): desplazamiento (default: 0)

**Respuesta:**

```json
{
  "data": [...],
  "total": 245,
  "limit": 100,
  "offset": 0
}
```

#### PUT `/api/inventory/:productId`

Actualiza el inventario y registra el movimiento automáticamente.

**Body requerido:**

```json
{
  "quantity": 150,
  "movementType": "entrada",
  "reason": "Compra a proveedor",
  "notes": "Orden PO-2024-001",
  "userId": 1
}
```

**Parámetros:**

- `quantity`: nueva cantidad (requerido)
- `movementType`: 'entrada', 'salida', 'ajuste', 'devolución' (default: 'ajuste')
- `reason`: motivo del cambio (opcional)
- `notes`: comentarios adicionales (opcional)
- `userId`: ID del usuario que hace el cambio (opcional)

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "product_id": 5,
    "previous_quantity": 100,
    "new_quantity": 150,
    "quantity_change": 50,
    "movement_type": "entrada",
    "reason": "Compra a proveedor"
  }
}
```

### 3. **Cómo Ejecutar la Migración**

```bash
# Navega al backend
cd backend

# Ejecuta el script de migración
node create_inventory_history.js
```

### 4. **Tipos de Movimiento**

- **entrada**: Aumento de inventario (compra, devolución de cliente, etc.)
- **salida**: Disminución de inventario (venta, uso en producción, etc.)
- **ajuste**: Corrección de cantidad (conteo físico, error de entrada, etc.)
- **devolución**: Devolución de producto

## Cambios en los Archivos

### `backend/routes/inventory.js`

- ✅ Agregado endpoint GET para obtener historial de un producto
- ✅ Agregado endpoint GET para obtener todos los movimientos
- ✅ Modificado PUT para registrar automáticamente cada movimiento
- ✅ Implementado transacciones para garantizar integridad de datos

### Nuevos Archivos

- ✅ `backend/db/inventory_history.sql` - Script SQL de las tablas
- ✅ `backend/create_inventory_history.js` - Script de migración automática

## Ventajas

1. **Auditoría completa**: Cada cambio queda registrado
2. **Trazabilidad**: Saber quién, qué, cuándo y por qué se cambió
3. **Reportes**: Generar reportes de movimientos de inventario
4. **Análisis**: Identificar patrones de movimiento
5. **Integridad**: Transacciones garantizan consistencia de datos

## Próximos Pasos (Recomendado)

1. Actualizar el frontend para mostrar el historial de movimientos
2. Crear reportes de movimientos de inventario
3. Implementar alertas de movimientos sospechosos
4. Agregar filtros por fecha y tipo de movimiento
