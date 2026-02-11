# 🎯 PANSOFT - Módulo de Órdenes (Migración Completada)

> **Estado**: ✅ **Production Ready**  
> **Versión**: 1.0.0  
> **Última actualización**: 10 de Febrero de 2026

---

## 📋 Tabla de Contenidos

- [Inicio Rápido](#-inicio-rápido)
- [Características](#-características)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Reference](#-api-reference)
- [Documentación](#-documentación)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Inicio Rápido

### 1. Preparar Base de Datos

```bash
# Ejecutar migraciones
mysql -u root -p pansoft_db < backend/db/add_supplies_and_production.sql

# (Opcional) Cargar datos de ejemplo
mysql -u root -p pansoft_db < backend/db/seed_supplies.sql
```

### 2. Iniciar Backend

```bash
cd backend
npm install
npm start
```

**Verificar**: `curl http://localhost:5000/api/health`

### 3. Iniciar Frontend

```bash
cd frontend
npm install
npm run dev
```

**Acceder**: `http://localhost:5173`

---

## ✨ Características

### ✅ Órdenes de Venta

- Crear/editar órdenes
- Asignar cliente
- Establecer fecha de entrega
- Cambiar estado
- Búsqueda y filtrado

### ✅ Órdenes de Producción

- Crear órdenes de fabricación
- Asignar producto y cantidad
- Seleccionar responsable
- **Agregar insumos personalizados**
- **Ver stock disponible vs. requerido**
- Establecer fecha límite
- Cambiar estado de producción

### ✅ Gestión de Insumos

- Listar insumos disponibles
- Validar stock
- Alertar sobre stock bajo
- Actualizar cantidades

### ✅ Características Técnicas

- Bootstrap 5 UI
- API RESTful
- Integración MySQL
- Validación en tiempo real
- Números de orden secuenciales
- Modales dinámicos
- Responsive design

---

## 🗂️ Estructura del Proyecto

```
pansoft/
├── backend/
│   ├── routes/
│   │   ├── production-orders.js  ⭐ NUEVO
│   │   ├── sales-orders.js       ⭐ NUEVO
│   │   ├── supplies.js           (actualizado)
│   │   └── ...
│   ├── db/
│   │   ├── add_supplies_and_production.sql  ⭐ NUEVO
│   │   ├── seed_supplies.sql    ⭐ NUEVO
│   │   ├── QUERIES_UTILES.sql   ⭐ NUEVO
│   │   └── ...
│   ├── server.js                (actualizado)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── orders.jsx        ⭐ REESCRITO (JSX/Bootstrap)
│   │   │   ├── Orders.css        ⭐ NUEVO
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.jsx           (actualizado)
│   │   └── ...
│   ├── index.html                (con Bootstrap CDN)
│   └── package.json
│
├── MIGRACION_COMPLETADA.md       ⭐ NUEVO
├── INSTALACION_FINAL.md          ⭐ NUEVO
├── FLUJOS_PROCESOS.md            ⭐ NUEVO
└── ...
```

---

## 📊 Base de Datos

### Tablas Principales

| Tabla                       | Filas                  | Relación              |
| --------------------------- | ---------------------- | --------------------- |
| `production_orders`         | Órdenes de fabricación | → products, employees |
| `production_order_supplies` | Insumos por orden      | → supplies            |
| `sales_orders`              | Órdenes de venta       | → customers           |
| `sales_order_items`         | Detalles de venta      | → products            |
| `sales_order_supplies`      | Insumos personalizados | → supplies            |
| `supplies`                  | Insumos/materiales     | -                     |
| `product_recipes`           | Recetas                | → products, supplies  |

```sql
-- Ver todas las órdenes de producción
SELECT po.*, p.name, e.first_name
FROM production_orders po
LEFT JOIN products p ON po.product_id = p.id
LEFT JOIN employees e ON po.responsible_employee_id = e.id;

-- Ver insumos de una orden
SELECT s.name, pos.quantity_required, s.stock_quantity
FROM production_order_supplies pos
LEFT JOIN supplies s ON pos.supply_id = s.id
WHERE pos.production_order_id = :id;
```

---

## 🔌 API Reference

### Production Orders

```
GET    /api/production-orders          # Listar todas
POST   /api/production-orders          # Crear nueva
GET    /api/production-orders/:id      # Obtener detalle
PUT    /api/production-orders/:id      # Actualizar
PATCH  /api/production-orders/:id/status   # Cambiar estado
DELETE /api/production-orders/:id      # Eliminar
```

### Sales Orders

```
GET    /api/sales-orders               # Listar todas
POST   /api/sales-orders               # Crear nueva
GET    /api/sales-orders/:id           # Obtener detalle
PUT    /api/sales-orders/:id           # Actualizar
PATCH  /api/sales-orders/:id/status    # Cambiar estado
DELETE /api/sales-orders/:id           # Eliminar
```

### Supplies

```
GET    /api/supplies                   # Listar todos
POST   /api/supplies                   # Crear nuevo
GET    /api/supplies/:id               # Obtener detalle
PUT    /api/supplies/:id               # Actualizar
PATCH  /api/supplies/:id/stock         # Actualizar stock
```

---

## 📚 Documentación

| Documento                   | Descripción                       |
| --------------------------- | --------------------------------- |
| **MIGRACION_COMPLETADA.md** | Resumen ejecutivo de la migración |
| **INSTALACION_FINAL.md**    | Guía completa de instalación      |
| **FLUJOS_PROCESOS.md**      | Diagramas de flujos de usuarios   |
| **MIGRACION_ORDENES.md**    | Detalles técnicos de la migración |

---

## 🎨 UI/UX

### Componentes Bootstrap Utilizados

- Cards (para estadísticas)
- Tables (responsive)
- Modals (para formularios)
- Badges (para estados)
- Buttons (outline, primary)
- Forms & Inputs (validados)
- Navigation Tabs
- Alerts & Toasts

### Diseño Responsive

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

### Estados Visuales

```
Órdenes de Venta:
  🟡 pending     (Amarillo)
  🟢 completed   (Verde)
  🔴 cancelada   (Rojo)

Órdenes de Producción:
  🟡 pendiente   (Amarillo)
  🔵 en_proceso  (Azul)
  🟢 completada  (Verde)
  🔴 cancelada   (Rojo)

Stock:
  🟢 OK          (Verde)
  🔴 Insuficiente (Rojo)
```

---

## 🧪 Testing

### Escenario Básico

1. **Crear Orden de Producción**
   - Ir a "Órdenes de Producción"
   - Click en "Nueva Orden de Producción"
   - Seleccionar Producto: "Pan Francés"
   - Cantidad: 100
   - Responsable: "María García"
   - Agregar insumos:
     - Harina de Trigo: 50 kg
     - Levadura Seca: 2 kg
   - Crear orden

2. **Ver Insumos**
   - Click en ícono📋 de la orden
   - Verificar stock disponible
   - Validación visual (verde/rojo)

3. **Cambiar Estado**
   - Click en ✓ para completar
   - Verificar que estado cambió
   - Botón desaparece

4. **Crear Orden de Venta**
   - Ir a "Órdenes de Venta"
   - Click en "Nueva Orden de Venta"
   - Seleccionar cliente
   - Crear orden

---

## 🔧 Configuración

### Backend (.env)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pansoft_db
PORT=5000
NODE_ENV=development
```

### Frontend (index.html)

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
  rel="stylesheet"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
/>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

---

## 🐛 Troubleshooting

### API no responde

```bash
# Verificar que backend está corriendo
curl http://localhost:5000/api/health

# Ver logs
# El backend debe estar en puerto 5000
```

### Tablas no existen

```bash
# Ejecutar migración
mysql -u root -p pansoft_db < backend/db/add_supplies_and_production.sql

# Verificar
mysql -u root -p pansoft_db -e "SHOW TABLES;"
```

### Bootstrap no funciona

- Verificar que CDN está en `index.html`
- Limpiar caché del navegador (Ctrl+Shift+Del)
- Revisar consola del navegador (F12)

### CORS error

- Verificar que `cors()` está en `server.js`
- Backend en `http://localhost:5000`
- Frontend en `http://localhost:5173`

---

## 📈 Estadísticas del Proyecto

| Métrica           | Valor        |
| ----------------- | ------------ |
| Rutas creadas     | 19 endpoints |
| Tablas BD         | 7 tablas     |
| Componentes React | 1 (Orders)   |
| Líneas de código  | ~1500+       |
| Documentación     | 4 archivos   |
| Funcionalidades   | 15+ features |

---

## ✅ Checklist de Verificación

- [x] Base de datos migrada
- [x] Backend con nuevas rutas
- [x] Frontend con Bootstrap
- [x] Órdenes de venta funcionales
- [x] Órdenes de producción funcionales
- [x] Gestión de insumos funcional
- [x] Validaciones en tiempo real
- [x] Persistencia en BD
- [x] Documentación completa
- [x] Testing básico

---

## 📞 Soporte

### Revisar primero:

1. Documentación en `INSTALACION_FINAL.md`
2. Flujos en `FLUJOS_PROCESOS.md`
3. Logs del backend (terminal)
4. Consola del navegador (F12)

### Queries útiles:

Ver `backend/db/QUERIES_UTILES.sql` para:

- Ver todas las órdenes
- Verificar stock
- Buscar órdenes
- Actualizar estados

---

## 🚀 Próximos Pasos

### Mejoras Futuras

- [ ] Reportes en PDF
- [ ] Gráficos de producción
- [ ] Notificaciones por email
- [ ] App móvil
- [ ] Sistema de alertas
- [ ] Analytics avanzados

### Optimizaciones

- [ ] Caché de datos
- [ ] Paginación en tablas
- [ ] Bulk operations
- [ ] Dark mode
- [ ] Multi-idioma

---

## 📄 Licencia

Proyecto privado de PANSOFT

---

## 🎉 ¡Gracias por usar PANSOFT!

**Migración completada exitosamente**  
**Fecha**: 10 de Febrero de 2026  
**Status**: ✅ Production Ready

---

<div align="center">

### Hecho con ❤️ usando React, Bootstrap y MySQL

[📚 Documentación](#-documentación) • [🚀 Inicio Rápido](#-inicio-rápido) • [🐛 Issues](#-troubleshooting)

</div>
