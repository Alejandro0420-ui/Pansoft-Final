# Pansoft - Sistema de Gestión para Panaderías

Sistema completo de gestión empresarial migrado a **React + JSX + Bootstrap** con backend **Node.js + Express + PostgreSQL**.

## 🚀 Características

- ✅ **Frontend moderno**: React 19 + Bootstrap 5 + JSX
- ✅ **Backend robusto**: Express.js + PostgreSQL
- ✅ **Interfaz intuitiva**: Responsive y mobile-friendly
- ✅ **Gestión completa**:
  - Dashboard con estadísticas en tiempo real
  - Inventario y productos
  - Órdenes y facturación
  - Empleados y proveedores
  - Reportes y análisis
  - Configuraciones de usuario

## 📋 Requisitos Previos

- Node.js (v16+)
- PostgreSQL (v12+)
- npm o yarn

## 🔧 Instalación

### 1. Configurar Base de Datos

```bash
# En PostgreSQL, ejecuta:
psql -U postgres
CREATE DATABASE pansoft_db;
\c pansoft_db
\i backend/db/init.sql
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus datos de PostgreSQL
# DB_USER=tu_usuario
# DB_PASSWORD=tu_contraseña
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=pansoft_db

# Iniciar servidor
npm run dev
# El servidor correrá en http://localhost:5000
```

### 3. Configurar Frontend

```bash
# En la raíz del proyecto (Pansoft-React+tsx)
npm install

# Iniciar desarrollo
npm run dev
# La app abrirá en http://localhost:3000
```

## 🏗️ Estructura del Proyecto

```
├── backend/                    # Backend Express + PostgreSQL
│   ├── routes/                # API endpoints
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── products.js
│   │   ├── inventory.js
│   │   ├── suppliers.js
│   │   ├── orders.js
│   │   ├── billing.js
│   │   ├── employees.js
│   │   └── reports.js
│   ├── db/
│   │   └── init.sql           # Schema de base de datos
│   ├── server.js              # Servidor principal
│   └── package.json
│
└── Pansoft-React+tsx/         # Frontend React + Bootstrap
    ├── src/
    │   ├── components/        # Componentes JSX
    │   │   ├── dashboard.jsx
    │   │   ├── inventory.jsx
    │   │   ├── products.jsx
    │   │   ├── suppliers.jsx
    │   │   ├── orders.jsx
    │   │   ├── billing.jsx
    │   │   ├── employees.jsx
    │   │   ├── reports.jsx
    │   │   ├── settings.jsx
    │   │   └── login.jsx
    │   ├── services/
    │   │   └── api.jsx        # Llamadas a API
    │   ├── App.jsx            # Componente principal
    │   ├── App.css            # Estilos globales
    │   ├── index.css
    │   ├── main.jsx
    │   └── index.html
    ├── vite.config.js
    ├── package.json
    └── README.md
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas
- `GET /api/dashboard/charts` - Datos de gráficos
- `GET /api/dashboard/alerts` - Alertas
- `GET /api/dashboard/activity` - Actividad reciente

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Inventario
- `GET /api/inventory` - Listar inventario
- `PUT /api/inventory/:id` - Actualizar inventario

### Proveedores
- `GET /api/suppliers` - Listar proveedores
- `POST /api/suppliers` - Crear proveedor
- `PUT /api/suppliers/:id` - Actualizar proveedor
- `DELETE /api/suppliers/:id` - Eliminar proveedor

### Órdenes
- `GET /api/orders` - Listar órdenes
- `POST /api/orders` - Crear orden
- `PUT /api/orders/:id` - Actualizar orden

### Facturación
- `GET /api/billing` - Listar facturas
- `POST /api/billing` - Crear factura
- `PUT /api/billing/:id` - Actualizar factura

### Empleados
- `GET /api/employees` - Listar empleados
- `POST /api/employees` - Crear empleado
- `PUT /api/employees/:id` - Actualizar empleado
- `DELETE /api/employees/:id` - Eliminar empleado

### Reportes
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/inventory` - Reporte de inventario
- `GET /api/reports/customers` - Reporte de clientes

## 🎨 Tecnologías Utilizadas

**Frontend:**
- React 19.2.0
- Bootstrap 5.3.2
- Lucide React (Iconos)
- Recharts (Gráficos)
- Axios (HTTP Client)
- Vite (Build tool)

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- CORS
- Dotenv

## 🔐 Seguridad

- Variables de entorno para credenciales
- JWT para autenticación (implementable)
- CORS configurado
- SQL Injection prevention con prepared statements

## 📝 Credenciales de Demo

- **Usuario**: admin
- **Contraseña**: password

*(Nota: Implementar hash seguro de contraseñas en producción)*

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deployar carpeta dist/
```

### Backend (Heroku/Railway)
```bash
# Asegurar variables de entorno configuradas
git push heroku main
```

## 🐛 Troubleshooting

**Error de conexión a BD:**
- Verificar que PostgreSQL está corriendo
- Comprobar las variables de .env
- Ejecutar init.sql en la base de datos

**Puerto 5000 en uso:**
```bash
# Cambiar puerto en .env
PORT=5001
```

**Errores CORS:**
- Verificar que el proxy está configurado en vite.config.js
- Comprobar que backend corre en puerto 5000

## 📧 Soporte

Para reportar problemas o solicitar funcionalidades, contacda a: info@pansoft.com

## 📄 Licencia

© 2025 Pansoft. Todos los derechos reservados.
