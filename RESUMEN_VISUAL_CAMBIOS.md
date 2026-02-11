# 📋 RESUMEN VISUAL DE CAMBIOS

## 🔄 ANTES vs DESPUÉS

### ÓRDENES DE VENTA

#### **ANTES:**

```
┌─ Nueva Orden de Venta ─┐
│ Cliente:     [Dropdown ▼] ← Seleccionar de lista
│ Fecha:       [Input date]
│ Productos:   (No había)
└────────────────────────┘
```

#### **DESPUÉS:**

```
┌─ Nueva Orden de Venta ─────────────────────┐
│ Cliente:     [Juan Pérez     ] ← Ingresa nombre
│ Fecha:       [2024-02-10     ]
│
│ Productos (Mínimo 1):
│ ───────────────────────────────────────────
│ Producto:    [Camisa Azul - $45.000   ▼]
│ Cantidad:    [2        ] [+Agregar]
│
│ Productos agregados:
│ • Camisa Azul: 2 x $45.000 = $90.000
│ • Pantalón Negro: 1 x $55.000 = $55.000
│   Total: $145.000
└────────────────────────────────────────────┘
```

---

### ÓRDENES DE PRODUCCIÓN

#### **ANTES:**

```
Orden PROD-001 creada - Producto: Camiseta, Cantidad: 100
```

#### **DESPUÉS:**

```
Orden PROD-001 creada - Producto: Camiseta, Cantidad: 100

Insumos con costos:
• Algodón: 50 kg x $2.500/kg = $125.000
• Botones: 100 ud x $150/ud = $15.000
• Hilo: 0.5 km x $5.000/km = $2.500
Total insumos: $142.500
```

---

## 📊 PRECIOS EN PESOS (COP)

### Ejemplos de Formato:

| Valor   | Antes    | Después    |
| ------- | -------- | ---------- |
| 1000    | $1000    | $1.000     |
| 45000   | $45000   | $45.000    |
| 1250000 | $1250000 | $1.250.000 |
| 3456789 | $3456789 | $3.456.789 |

### Subtotales en Órdenes:

```
Camisa Azul:  2 x $45.000 = $90.000
Pantalones:   3 x $55.000 = $165.000
             ─────────────────────
             TOTAL: $255.000
```

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### Tabla `sales_orders` - ANTES

```sql
┌─────────────┬──────────────┬──────────┐
│ id          │ order_number │ customer │ ... (otra info)
│ 1           │ VNT-001      │ 5        │ ← Requiere que exista customer_id=5
└─────────────┴──────────────┴──────────┘
```

### Tabla `sales_orders` - DESPUÉS

```sql
┌─────────────┬──────────────┬──────────┬────────────────┐
│ id          │ order_number │ customer │ customer_name  │ ... (otra info)
│ 1           │ VNT-001      │ NULL     │ "Juan Pérez"   │ ← Puede ser NULL o un nombre
│ 2           │ VNT-002      │ 5        │ "Acme Corp"    │ ← Usa nombre del cliente de tabla
└─────────────┴──────────────┴──────────┴────────────────┘
```

---

## ✅ CHECKLIST DE INSTALACIÓN

### 1. Backend

- [x] Migración de BD ejecutada (`migrate_sales_orders.js`)
- [ ] Backend reiniciado (`npm start` en carpeta /backend)

### 2. Frontend

- [ ] Caché del navegador limpiado (Ctrl+F5)
- [ ] Página recargada

### 3. Verificación

- [ ] Crear orden de venta con cliente manual → ✅ Funciona
- [ ] Crear orden de producción → ✅ Funciona
- [ ] Precios mostrados en formato $ X.XXX → ✅ Funciona

---

## 🐛 TROUBLESHOOTING

### Problema: "Error al crear orden de venta"

**Solución:**

1. Abre F12 (DevTools)
2. Ve a pestaña "Network"
3. Crea una orden
4. Haz clic en la petición `/api/sales-orders`
5. Ve la respuesta en "Response"
6. Comparte el error

### Problema: Órdenes de producción no se crean

**Solución:**

1. Abre F12 → Console
2. Crea una orden
3. Revisa los logs: busca "Enviando orden de producción:"
4. Verifica que el productos y empleado existan en la BD

### Problema: Los precios aparecen como NaN

**Solución:**

1. Verifica que los productos tengan field `price` en BD
2. Recarga la página (Ctrl+F5)
3. Borra cache del navegador

---

## 📁 ARCHIVOS MODIFICADOS

```
frontend/src/components/
└── orders.jsx ← Cliente manual, precios en pesos, mejor manejo de errores

backend/routes/
├── sales-orders.js ← Acepta customer_name manual
└── production-orders.js ← (Sin cambios, solo mejoras frontend)

backend/
├── migrate_sales_orders.js ← Script nuevo para migración
└── db/
    └── update_sales_orders_manual_customer.sql ← Script SQL (backup)
```

---

## 🎯 FLUJO DE DATOS

### Crear Orden de Venta

```
┌──────────────────────────────────┐
│ Usuario ingresa datos en modal   │
│ • Cliente: "Juan Pérez"          │
│ • Productos: 2 items             │
│ • Fecha entrega opcional         │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│ Frontend valida datos            │
│ • Cliente ≠ vacio                │
│ • Cantidad de items ≥ 1          │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│ POST /api/sales-orders           │
│ {                                │
│   customer_name: "Juan Pérez",   │
│   items: [{...}, {...}],         │
│   delivery_date: "2024-02-20"    │
│ }                                │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│ Backend procesa:                 │
│ • Genera VNT-001                 │
│ • Guarda en BD (sin customer_id) │
│ • Inserta items                  │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│ Frontend muestra éxito:          │
│ "Orden VNT-001 creada -          │
│  Cliente: Juan Pérez, 2 prod."   │
└──────────────────────────────────┘
```

---

## 💡 VENTAJAS DE LOS CAMBIOS

✅ **Flexibilidad**: No necesitas crear un cliente en la BD primero
✅ **Claridad**: Precios en pesos fáciles de leer (1.250.000 vs 1250000)
✅ **Eficiencia**: Órdenes de producción muestran costos totales
✅ **Robustez**: Mejor manejo de errores con mensajes descriptivos
✅ **UX Mejorada**: Subtotales calculados automáticamente
