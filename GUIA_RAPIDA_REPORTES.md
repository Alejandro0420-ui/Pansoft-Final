# 🎯 Guía Rápida - Módulo de Reportes 100% Funcional

## ✅ Lo que se Implementó

### 1. **Backend Mejorado** (`backend/routes/reports.js`)

- 8 endpoints (antes 3)
- Filtros dinámicos por fecha y estado
- Cálculos automáticos de totales
- Estados de stock inteligentes

### 2. **Frontend Refactorizado** (`frontend/src/components/reports.jsx`)

- 14 componentes modularizados
- Custom hook `useReportsLogic` para API
- Filtros de búsqueda funcionales
- Descarga CSV en cada tabla
- Gráfico de ventas diarias

### 3. **API Client Actualizado** (`frontend/src/services/api.jsx`)

- Métodos para los 8 nuevos endpoints
- Soporte de parámetros dinámicos

## 📊 Reportes Disponibles

| #   | Reporte                  | Filtros       | CSV | Función                                  |
| --- | ------------------------ | ------------- | --- | ---------------------------------------- |
| 1   | **Gráfico de Ventas**    | Fecha         | -   | Visualización temporal de ventas         |
| 2   | **Órdenes de Venta**     | Estado, Fecha | ✅  | Detalle de cada orden con cliente        |
| 3   | **Órdenes Producción**   | Estado        | ✅  | Órdenes de fabricación                   |
| 4   | **Inventario Productos** | -             | ✅  | Stock con estado (Bajo/Medio/Suficiente) |
| 5   | **Empleados**            | -             | ✅  | Personal con órdenes asignadas           |
| 6   | **Clientes**             | -             | ✅  | Ranking por gasto total                  |
| 7   | **Inventario Completo**  | -             | ✅  | Stock actual de todos                    |
| 8   | **Dashboard**            | -             | -   | 4 KPIs principales                       |

## 🚀 Cómo Usar

### Acceder a Reportes

```
http://localhost:5173
Menú lateral → Reportes
```

### Aplicar Filtros

1. Selecciona rango de fechas (Desde/Hasta)
2. Elige estado (Pendiente/Completada/Cancelada)
3. Los datos se actualizan automáticamente
4. Haz clic "Limpiar Filtros" para reset

### Descargar Reportes

- Cada tabla tiene botón "CSV" en esquina superior derecha
- Genera archivo con fecha: `reporte_2024-02-15.csv`
- Compatible con Excel, Google Sheets, etc.

### Actualizar Datos

- Botón "Actualizar" arriba a la derecha
- Recarga todos los datos del servidor

## 🔧 Estructura de Carpetas

```
frontend/src/components/
├── reports.jsx                   ← Componente principal
└── reports/                      ← Módulo modularizado
    ├── constants.js              ← Colores y opciones
    ├── useReportsLogic.js        ← Lógica y API
    ├── ReportFilters.jsx         ← Filtros de búsqueda
    ├── DownloadButton.jsx        ← Descarga CSV
    ├── ReportTable.jsx           ← Tabla reutilizable
    ├── StatCard.jsx              ← Tarjeta de estadística
    ├── SummarySection.jsx        ← Dashboard de KPIs
    ├── SalesChartSection.jsx     ← Gráfico de ventas
    ├── SalesOrdersSection.jsx    ← Tabla órdenes venta
    ├── ProductionOrdersSection.jsx ← Tabla órdenes producción
    ├── ProductsSection.jsx       ← Tabla productos
    ├── EmployeesSection.jsx      ← Tabla empleados
    ├── CustomersSection.jsx      ← Tabla clientes
    └── InventorySection.jsx      ← Tabla inventario
```

## 🎨 Características Visuales

- **Colores de Estado**: Rojo (Bajo Stock), Naranja (Medio), Verde (Suficiente)
- **Tema**: Naranja (#EA7028) principal con acentos
- **Bootstrap 5**: Responsive en móvil y desktop
- **Iconos**: Lucide React para cada sección
- **Tablas**: Hover effect y scroll horizontal

## 💡 Ejemplos de Uso

### Filtrar órdenes de venta por mes

```
1. Desde: 2024-02-01
2. Hasta: 2024-02-29
3. Estado: Completada
4. La tabla muestra solo órdenes completadas del mes
```

### Auditar inventario bajo

```
1. Ver tabla "Inventario de Productos"
2. Buscar items con estado "Bajo" (rojo)
3. Descargar CSV para reporte de reorden
```

### Revisar desempeño de empleados

```
1. Ver tabla "Empleados"
2. Columna "Órdenes" muestra productividad
3. Descargar para evaluación trimestral
```

## 🔄 Flujo de Datos

```
Usuario interactúa con Filtros
       ↓
useReportsLogic aplica filtros
       ↓
API hace GET a /reports/xxx con parámetros
       ↓
Backend ejecuta queries con WHERE dinámicos
       ↓
Datos vuelven al frontend
       ↓
Componentes renderean tablas/gráficos
       ↓
Usuario descarga CSV o visualiza
```

## 📱 Responsive Design

- **Desktop**: Tablas completas, gráficos grandes
- **Tablet**: Scroll horizontal en tablas
- **Móvil**: Stack vertical, componentes adaptados
- Filtros responsivos que se reorganizan

## ✨ Validaciones Implementadas

✅ Manejo de datos nulos  
✅ Formateo automático de moneda ($)  
✅ Conversión de fechas a localización  
✅ Conteos con valores por defecto  
✅ Escapado de caracteres en CSV  
✅ Estados de carga y error

## 🐛 Troubleshooting

### "No se cargan los reportes"

- Verifica que backend está corriendo: `npm start` en carpeta backend
- Revisa consola del navegador (F12 → Console)
- Asegúrate que MySQL está activo

### "Filtros no funcionan"

- Recarga la página (F5)
- Limpia LocalStorage: `localStorage.clear()`
- Verifica que hay datos en la BD

### "Descarga CSV vacía"

- Asegúrate que existen datos en ese período
- Prueba sin filtros primero
- Revisa que el producto/empleado tiene registros

## 📞 Fórmulas Utilizadas

**Estado de Stock:**

```sql
CASE
  WHEN stock <= min_level THEN 'Bajo'
  WHEN stock <= min_level * 2 THEN 'Medio'
  ELSE 'Suficiente'
END
```

**Total Invertido en Inventario:**

```sql
stock_quantity * price
```

**Total Gastado por Cliente:**

```sql
SUM(sales_orders.total_amount)
```

## 🎓 Próximas Mejoras (Futuro)

- [ ] Exportar a PDF
- [ ] Gráficos de producción
- [ ] Reportes por categoría
- [ ] Alertas de bajo stock
- [ ] Email automático de reportes
- [ ] Búsqueda avanzada en tablas
- [ ] Personalizar columnas visibles

## 📞 Soporte

El módulo está completamente funcional con:

- ✅ Filtros dinámicos
- ✅ Descarga CSV
- ✅ 8 reportes diferentes
- ✅ Dashboard de estadísticas
- ✅ Código modular y mantenible

¡Listo para usar en producción! 🚀
