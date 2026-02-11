# Módulo de Facturación (Billing)

## Descripción

Sistema completo de facturación construido con React y Bootstrap, 100% conectado a la base de datos MySQL a través de API REST.

## Estructura de Componentes

### Archivo Principal: `billing.jsx`

- Componente contenedor principal que gestiona todo el estado
- Conexión con API backend
- Gestión de modales y filtrado
- ~180 líneas de código limpio

### Sub-componentes Reutilizables

#### 1. **InvoiceStatsCard.jsx**

Tarjeta de estadísticas individual

- Props:
  - `title`: Título de la estadística
  - `count`: Número a mostrar
  - `icon`: Componente de ícono (Lucide React)
  - `color`: Color de la tarjeta (orange, gold, success, danger)

```jsx
<InvoiceStatsCard
  title="Total Facturas"
  count={stats.total}
  icon={FileText}
  color="orange"
/>
```

#### 2. **InvoiceFilters.jsx**

Barra de filtros y búsqueda

- Props:
  - `searchTerm`: Término de búsqueda
  - `onSearchChange`: Callback de búsqueda
  - `statusFilter`: Estado actual seleccionado
  - `onStatusChange`: Callback de cambio de estado
  - `dateFilter`: Fecha seleccionada
  - `onDateChange`: Callback de cambio de fecha
  - `onExport`: Callback de exportación

#### 3. **InvoiceTable.jsx**

Tabla de facturas con acciones

- Props:
  - `invoices`: Array de facturas
  - `loading`: Estado de carga
  - `onView`: Callback para ver detalles
  - `onDownload`: Callback para descargar PDF
  - `onDelete`: Callback para eliminar
- Features:
  - Estados con badges de color
  - Formateo de moneda COP
  - Responsive design
  - Empty state

#### 4. **InvoiceModal.jsx**

Modal para crear/editar facturas

- Props:
  - `show`: Mostrar/ocultar
  - `onClose`: Callback al cerrar
  - `title`: Título del modal
  - `invoice`: Datos de factura (edición)
  - `customers`: Lista de clientes
  - `orders`: Lista de órdenes
  - `onSubmit`: Callback al guardar
  - `loading`: Estado de carga
- Campos:
  - Número de factura (auto-generado)
  - Cliente (select)
  - Orden (select opcional)
  - Fecha emisión
  - Fecha vencimiento
  - Total
  - Estado

#### 5. **InvoiceViewModal.jsx**

Modal de lectura para ver detalles

- Props:
  - `show`: Mostrar/ocultar
  - `onClose`: Callback al cerrar
  - `invoice`: Datos de factura
- Muestra:
  - Detalles completos
  - Monto pendiente
  - Opción descargar PDF

## API Endpoints Utilizados

```
GET    /api/billing           - Obtener todas las facturas
POST   /api/billing           - Crear nueva factura
PUT    /api/billing/:id       - Actualizar factura (estado, pagado)
DELETE /api/billing/:id       - Eliminar factura
GET    /api/customers         - Obtener clientes (dropdown)
GET    /api/sales-orders      - Obtener órdenes (dropdown)
```

## Estado Global

```javascript
{
  invoices: [],           // Array de facturas
  customers: [],          // Array de clientes
  orders: [],            // Array de órdenes
  loading: false,        // Estado de carga
  searchTerm: "",        // Término de búsqueda
  statusFilter: "all",   // Filtro de estado
  dateFilter: "",        // Filtro de fecha
  showCreateModal: false, // Modal crear
  showViewModal: false,   // Modal ver
  selectedInvoice: null   // Factura seleccionada
}
```

## Estilos CSS

Archivo dedicado: `billing.css`

- Estilos de botones personalizados
- Animaciones suaves
- Diseño responsive
- Color scheme consistente (#EA7028, #EBB583)

## Funcionalidades

✅ Crear facturas
✅ Ver detalles de facturas
✅ Editar estado y pagos
✅ Eliminar facturas
✅ Buscar y filtrar
✅ Estadísticas en tiempo real
✅ Formateo de moneda COP
✅ Modales reutilizables
✅ Estados visuales con badges
✅ Validación de formularios
✅ Notificaciones con toast

## Instalación

1. Importar en App.jsx:

```jsx
import { Billing } from "./components/billing";
```

2. Usar en rutas:

```jsx
<Route path="/billing" element={<Billing />} />
```

## Características de Diseño

- **Color Primario**: #EA7028 (Naranja)
- **Color Secundario**: #EBB583 (Melocotón claro)
- **Frameworks**: Bootstrap 5 + React 18
- **Icons**: Lucide React (18px por defecto)
- **Notificaciones**: Sonner toast
- **Requests HTTP**: Axios

## Performance

- Componentes funcionales con hooks
- Estado mínimo necesario
- Memoización donde es aplicable
- Carga lazy de datos
- ~250 líneas totales de código reutilizable
