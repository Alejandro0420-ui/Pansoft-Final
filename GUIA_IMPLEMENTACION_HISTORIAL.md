# Guía de Implementación - Historial de Inventario

## Paso 1: Ejecutar la Migración de Base de Datos

```bash
# Desde la carpeta backend
cd backend
node create_inventory_history.js
```

## Paso 2: Verificar que la Migración se Completó

Ejecuta esta query en MySQL para verificar las nuevas tablas:

```sql
SHOW TABLES LIKE '%movements%';
DESC inventory_movements;
DESC supplies_movements;
```

Deberías ver:

- Tabla `inventory_movements`
- Tabla `supplies_movements`

## Paso 3: Actualizar el Frontend (RECOMENDADO)

Para que el historial se cargue desde la base de datos, necesitas actualizar el componente `inventory.jsx`:

### 3.1 Agregar la carga del historial en useEffect

En [frontend/src/components/inventory.jsx](frontend/src/components/inventory.jsx), después de la función `loadData()`, agrega esto:

```javascript
// Cargar historial de movimientos desde API
const loadMovementsHistory = async () => {
  try {
    const response = await fetch(
      "/api/inventory/history/all/movements?limit=50",
    );
    const data = await response.json();

    if (data.data) {
      // Convertir al formato que el componente espera
      const formatted = data.data.map((movement) => ({
        id: movement.id,
        date: new Date(movement.created_at).toISOString().split("T")[0],
        product: movement.product_name,
        type: movement.movement_type === "entrada" ? "entrada" : "salida",
        quantity: Math.abs(movement.quantity_change),
        motivo: movement.reason,
        user: movement.user_name || "Sistema",
      }));

      setMovements(formatted);
    }
  } catch (error) {
    console.error("Error cargando historial:", error);
  }
};
```

### 3.2 Llamar a `loadMovementsHistory()` en el useEffect principal

```javascript
useEffect(() => {
  loadData();
  loadMovementsHistory();
}, []);
```

### 3.3 Actualizar el handler `handleAddMovement`

Reemplaza la parte donde se crea `newMovement` por:

```javascript
// Registrar movimiento en la API con información adicional
const bodyData = {
  quantity: newStock,
  movementType: movementForm.type,
  reason: movementForm.motivo,
  notes: `Movimiento desde interfaz de inventario`,
  userId: 1, // Reemplazar con el ID del usuario autenticado
};

await api.update(item.id, {
  name: item.name,
  sku: item.code,
  category: item.category,
  stock_quantity: newStock,
  min_stock_level: item.min,
  price: parseFloat(item.price.replace("$", "")),
  unit: item.unit,
  supplier_id: item.supplier,
  ...bodyData,
});
```

## Paso 4: Probar los Nuevos Endpoints

### Prueba en Postman o con curl:

**GET - Obtener historial de un producto:**

```bash
curl http://localhost:3000/api/inventory/5/history
```

**GET - Obtener todos los movimientos:**

```bash
curl "http://localhost:3000/api/inventory/history/all/movements?limit=20&offset=0"
```

**PUT - Actualizar inventario (registra automáticamente):**

```bash
curl -X PUT http://localhost:3000/api/inventory/5 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 150,
    "movementType": "entrada",
    "reason": "Compra a proveedor",
    "notes": "Orden PO-2024-001",
    "userId": 1
  }'
```

## Paso 5: Ver el Historial Registrado

Ejecuta la query en MySQL:

```sql
SELECT * FROM inventory_movements ORDER BY created_at DESC LIMIT 10;
```

Deberías ver todos los movimientos registrados con:

- Producto y cantidad anterior/nueva
- Tipo de movimiento
- Razón del cambio
- Usuario que lo hizo
- Fecha y hora exacta

## Datos Que Ahora Se Registran

Cada movimiento de inventario ahora incluye:

| Campo               | Descripción                         |
| ------------------- | ----------------------------------- |
| `id`                | Identificador único                 |
| `product_id`        | ID del producto                     |
| `movement_type`     | entrada, salida, ajuste, devolución |
| `quantity_change`   | Diferencia de cantidad (+/-)        |
| `previous_quantity` | Stock anterior                      |
| `new_quantity`      | Stock nuevo                         |
| `reason`            | Motivo del cambio                   |
| `notes`             | Notas adicionales                   |
| `user_id`           | Quién hizo el cambio                |
| `created_at`        | Fecha y hora                        |

## Tipos de Movimiento

- **entrada**: Incremento de stock (compras, devoluciones)
- **salida**: Decremento de stock (ventas, uso en producción)
- **ajuste**: Correcciones por conteo físico
- **devolución**: Devoluciones de clientes

## Ejemplo de Respuesta del API

```json
[
  {
    "id": 1,
    "product_id": 5,
    "product_name": "Pan Baguette",
    "sku": "PAN-001",
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

## Ventajas de Esta Solución

✅ **Auditoría completa**: Cada cambio queda registrado  
✅ **Trazabilidad**: Saber quién, qué, cuándo y por qué  
✅ **Reportes**: Base para análisis de movimientos  
✅ **Integridad**: Transacciones garantizan consistencia  
✅ **Eficiencia**: Índices para búsquedas rápidas

## Identificación de Problemas

### ¿El historial sigue vacío?

1. Verifica que la tabla existe:

   ```sql
   SELECT COUNT(*) FROM inventory_movements;
   ```

2. Verifica los logs del servidor:

   ```bash
   # En el terminal del backend
   # Deberías ver "✅ Tabla inventory_movements creada"
   ```

3. Haz un movimiento manual y verifica:
   ```sql
   SELECT * FROM inventory_movements WHERE product_id = 5;
   ```

### Si obtienes error "Table doesn't exist"

```bash
# Re-ejecuta la migración
node create_inventory_history.js
```

## Próximos Pasos

1. **Reportes avanzados**: Crear reportes de movimientos por fecha, usuario, tipo
2. **Alertas**: Notificar cambios significativos de inventario
3. **Análisis**: Gráficos de tendencias de movimiento
4. **Auditoría**: Vista de auditoría con filtros avanzados
