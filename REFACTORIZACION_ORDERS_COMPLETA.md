# Refactorización del Módulo de Orders

## 📊 Resumen

El módulo `orders.jsx` ha sido completamente refactorizado para mejorar el mantenimiento, escalabilidad y reutilización del código, sin perder funcionalidad ni estilo visual.

---

## 📁 Estructura Nueva

### Antes (Monolítico)
```
components/
  └── orders.jsx  (838 líneas - todo mezclado)
```

### Después (Modular)
```
components/
  ├── orders.jsx (Component principal - 220 líneas)
  └── orders/
      ├── constants.js              (Todas las constantes)
      ├── useOrdersLogic.js         (Hook personalizado para lógica)
      ├── StatusBadge.jsx           (Badge de estado)
      ├── StatCard.jsx              (Tarjeta de estadísticas)
      ├── SupplyInput.jsx           (Input de insumo)
      ├── SearchBar.jsx             (Barra de búsqueda)
      ├── OrdersHeader.jsx          (Encabezado y tabs)
      ├── SalesOrdersTable.jsx      (Tabla de órdenes de venta)
      ├── ProductionOrdersTable.jsx (Tabla de órdenes de producción)
      ├── OrderFormModal.jsx        (Modal de crear/editar orden)
      └── SuppliesModalNew.jsx      (Modal de insumos)
```

---

## 🔧 Cambios Principales

### 1. **Constants** (`constants.js`)
Extrae todas las constantes a un archivo centralizado:
- `PRODUCT_PRICES` - Precios de productos
- `AVAILABLE_SUPPLIES` - Suministros disponibles
- `EMPLOYEES` - Lista de empleados
- `PRODUCT_RECIPES` - Recetas de producción
- `STATUS_COLORS` - Colores de estados
- `THEME_COLORS` - Paleta de colores principal
- `UNIT_OPTIONS` - Opciones de unidades

**Beneficio**: Cambiar datos es más fácil, centralizados en un solo lugar.

### 2. **Custom Hook** (`useOrdersLogic.js`)
Extrae toda la lógica de conexión con la API:
- `loadOrders()` - Carga órdenes desde BD
- Manejo de errores específicos
- Estados relacionados (loading, needRefresh)

**Beneficio**: Lógica reutilizable en otros componentes si es necesario.

### 3. **Componentes Reutilizables**

#### `StatusBadge.jsx`
Renderiza el badge de estado (completada, pendiente, cancelada, etc.)
```jsx
<StatusBadge status={order.status} />
```

#### `StatCard.jsx`
Tarjeta de estadísticas con icono y valor
```jsx
<StatCard label="Órdenes de Venta" value={5} icon={ShoppingCart} />
```

#### `SupplyInput.jsx`
Input para agregar/eliminar insumos
```jsx
<SupplyInput supply={supply} onRemove={removeSupply} index={0} />
```

### 4. **Componentes de Layout Grandes**

#### `OrdersHeader.jsx`
- Encabezado principal
- Tabs de navegación
- Estadísticas

#### `SearchBar.jsx`
- Búsqueda y filtrado
- Botón de nueva orden

#### `SalesOrdersTable.jsx` & `ProductionOrdersTable.jsx`
- Tablas responsivas
- Acciones por fila (editar, cambiar estado, ver insumos)

### 5. **Modales Refactorizados**

#### `OrderFormModal.jsx`
Modal para crear/editar órdenes
- Maneja ambos tipos (venta y producción)
- Gestión de insumos
- Cálculo automático de totales

#### `SuppliesModalNew.jsx`
Modal para ver insumos
- Insumos personalizados
- Recetas sugeridas (para órdenes de producción)
- Stock disponible

---

## 📈 Métricas de Mejora

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Líneas en archivo principal | 838 | 220 | 74% reducción |
| Componentes reutilizables | 3 | 11 | +8 componentes |
| Archivos | 1 | 11 | Mejor organización |
| Constantes centralizadas | No | Sí | Mantenimiento fácil |

---

## 🎯 Ventajas de la Refactorización

✅ **Legibilidad**: Cada archivo tiene una responsabilidad clara  
✅ **Mantenibilidad**: Cambios localizados y seguros  
✅ **Reutilización**: Componentes pueden usarse en otros módulos  
✅ **Testing**: Más fácil de testear componentes pequeños  
✅ **Performance**: Mejor carga y cambios de estado  
✅ **Escalabilidad**: Agregar features sin afectar otros  

---

## 🔄 Flujo de Datos

```
Orders (Principal)
  ├── useOrdersLogic (Hook) → API Calls
  ├── OrdersHeader
  │   └── StatCards
  ├── SearchBar
  ├── [Sales/Production]OrdersTable
  │   └── StatusBadge
  ├── OrderFormModal
  │   └── SupplyInput
  └── SuppliesModal
```

---

## 💡 Uso de Componentes

### Usar StatusBadge en otro componente:
```jsx
import { StatusBadge } from "./orders/StatusBadge";

<StatusBadge status="completada" />
```

### Usar StatCard en otro componente:
```jsx
import { StatCard } from "./orders/StatCard";
import { ShoppingCart } from "lucide-react";

<StatCard 
  label="Total Ventas" 
  value={100} 
  icon={ShoppingCart}
  color="#EA7028"
/>
```

### Usar Custom Hook en otro componente:
```jsx
import { useOrdersLogic } from "./orders/useOrdersLogic";

export function MyComponent() {
  const { salesOrders, productionOrders, loading } = useOrdersLogic();
  // ...
}
```

---

## 🚀 Próximas Mejoras Recomendadas

1. Agregar validaciones con `zod` o `yup`
2. Implementar paginación en tablas
3. Agregar filtros avanzados
4. Cache de datos con React Query
5. Reestructurar tablas como componentes genéricos
6. Internacionalización (i18n)

---

## ✅ Verificación

Asegúrese que:
- [ ] El modal de crear orden abre sin errores
- [ ] Ambas pestañas (Venta/Producción) funcionan
- [ ] La búsqueda filtra correctamente
- [ ] Los botones de acción funcionan
- [ ] Los estilos se mantienen igual
- [ ] Los insumos se pueden agregar/eliminar
- [ ] Los totales se calculan correctamente

