# Migración Completada: Módulo de Órdenes con Bootstrap y Base de Datos

## 📋 Resumen de Cambios

Se ha completado la migración del módulo de órdenes de TypeScript/Tailwind a JSX/Bootstrap con integración completa a la base de datos MySQL.

## 🗄️ Base de Datos

### Tablas Creadas (ejecutar en MySQL):

```sql
-- Archivo: backend/db/add_supplies_and_production.sql
```

Ejecutar la migración:

```bash
mysql -u root -p pansoft_db < backend/db/add_supplies_and_production.sql
```

**Tablas nuevas:**

- `supplies` - Insumos/materiales
- `production_orders` - Órdenes de producción
- `production_order_supplies` - Insumos necesarios por orden de producción
- `product_recipes` - Recetas (insumos necesarios por producto)
- `sales_orders` - Órdenes de venta
- `sales_order_items` - Detalles de ventas
- `sales_order_supplies` - Insumos personalizados en órdenes de venta

## 🔧 Backend

### Nuevas Rutas API

**Production Orders**

- `GET /api/production-orders` - Obtener todas las órdenes de producción
- `GET /api/production-orders/:id` - Obtener orden con insumos
- `POST /api/production-orders` - Crear nueva orden de producción
- `PUT /api/production-orders/:id` - Actualizar orden
- `PATCH /api/production-orders/:id/status` - Cambiar estado
- `DELETE /api/production-orders/:id` - Eliminar orden

**Sales Orders**

- `GET /api/sales-orders` - Obtener todas las órdenes de venta
- `GET /api/sales-orders/:id` - Obtener orden con detalles
- `POST /api/sales-orders` - Crear nueva orden de venta
- `PUT /api/sales-orders/:id` - Actualizar orden
- `PATCH /api/sales-orders/:id/status` - Cambiar estado
- `DELETE /api/sales-orders/:id` - Eliminar orden

**Supplies (Ampliadas)**

- Nuevos endpoints para gestionar recetas de productos
- `/api/supplies/recipes/:productId` - Obtener insumos necesarios por producto
- `/api/supplies/recipes/create` - Crear receta

### Archivos Creados/Modificados

- `backend/routes/production-orders.js` - Nueva ruta
- `backend/routes/sales-orders.js` - Nueva ruta
- `backend/routes/supplies.js` - Ampliada con recetas
- `backend/db/add_supplies_and_production.sql` - Migraciones
- `backend/server.js` - Actualizado con nuevas rutas

## 🎨 Frontend

### Componente Orders.jsx

**Características:**

- ✅ Interfaz con Bootstrap 5
- ✅ Dos pestañas: Órdenes de Venta y Órdenes de Producción
- ✅ Modales para crear/editar órdenes
- ✅ Gestión de insumos personalizados
- ✅ Visualización de insumos necesarios
- ✅ Estados dinámicos (Pendiente, En Proceso, Completada, Cancelada)
- ✅ Búsqueda y filtrado
- ✅ Integración con API backend

**Funcionalidades principales:**

1. **Órdenes de Venta:**
   - Crear nuevas órdenes
   - Asignar clientes
   - Establecer fecha de entrega
   - Cambiar estado (Pendiente → Completada → Cancelada)

2. **Órdenes de Producción:**
   - Crear órdenes de fabricación
   - Asignar responsable (empleado)
   - Especificar cantidad a producir
   - **Agregar insumos necesarios**
   - Establecer fecha límite
   - Ver insumos requeridos con estado de stock
   - Cambiar estado del proceso

3. **Gestión de Insumos:**
   - Modal que muestra insumos personalizados
   - Indica stock disponible vs. cantidad requerida
   - Alerta visual si hay stock insuficiente
   - Permite agregar/eliminar insumos de la orden

### Archivos Creados

- `frontend/src/components/orders.jsx` - Componente principal
- `frontend/src/components/Orders.css` - Estilos Bootstrap
- `frontend/src/services/api.jsx` - Actualizado con nuevas APIs

## 🚀 Instalación y Ejecución

### 1. Crear las tablas en la BD

```bash
# En la carpeta backend
mysql -u root -p pansoft_db < db/add_supplies_and_production.sql
```

### 2. Iniciar el backend

```bash
cd backend
npm start
```

### 3. Iniciar el frontend

```bash
cd frontend
npm run dev
```

### 4. Acceder a la aplicación

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 📝 Ejemplo de Uso

### Crear una Orden de Producción:

1. Ir a "Órdenes de Producción"
2. Hacer clic en "Nueva Orden de Producción"
3. Seleccionar:
   - **Producto**: Pan Francés
   - **Cantidad**: 100 unidades
   - **Responsable**: María García
4. Agregar insumos (opcional):
   - Harina de Trigo: 50 kg
   - Levadura Seca: 2 kg
5. Hacer clic en "Crear Orden"

**Resultado:**

- Se crea la orden PROD-001
- Se muestran los insumos necesarios
- Se puede ver el stock disponible vs. requerido

## 🔄 Estados de Órdenes

### Órdenes de Venta:

- **pending** (Pendiente) - Amarillo
- **completed** (Completada) - Verde
- **cancelada** (Cancelada) - Rojo

### Órdenes de Producción:

- **pendiente** (Pendiente) - Amarillo
- **en_proceso** (En Proceso) - Azul
- **completada** (Completada) - Verde
- **cancelada** (Cancelada) - Rojo

## 📊 Conexión a Base de Datos

Toda la información se guarda en MySQL:

- Las órdenes se crean con números secuenciales (VNT-001, PROD-001, etc.)
- Los insumos se asocian a las órdenes
- Se pueden actualizar estados en tiempo real
- Los datos persisten en la BD

## ⚠️ Notas Importantes

1. **Bootstrap CSS**: Asegúrate de que Bootstrap 5 esté incluido en tu `index.html`:

   ```html
   <link
     href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
     rel="stylesheet"
   />
   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
   ```

2. **Bootstrap Icons**: Para los iconos se usa `bi bi-*`:

   ```html
   <link
     rel="stylesheet"
     href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
   />
   ```

3. **Variables de entorno**: Actualiza `.env` del backend si es necesario:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=pansoft_db
   PORT=5000
   ```

## 🐛 Troubleshooting

Si la API no responde:

1. Verifica que el backend esté corriendo en puerto 5000
2. Confirma que las tablas fueron creadas en MySQL
3. Revisa los logs del backend para errores
4. Asegúrate de que CORS está habilitado

## 📞 Contacto

Para preguntas o issues, revisa los logs del terminal y la consola del navegador.
