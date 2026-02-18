import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import upload from "./multerConfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ charset: "utf-8" }));
app.use(express.static("uploads")); // Servir archivos estáticos

// Middleware para establecer charset en respuestas JSON
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pansoft_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

console.log("DB Config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? "***" : "",
  database: process.env.DB_NAME,
});

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log("✓ Conectado a MySQL");
    connection.release();
  })
  .catch((err) => {
    console.error("Error en la conexión a MySQL:", err);
  });

// Routes
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import inventoryRoutes from "./routes/inventory.js";
import productsRoutes from "./routes/products.js";
import suppliesRoutes from "./routes/supplies.js";
import suppliersRoutes from "./routes/suppliers.js";
import customersRoutes from "./routes/customers.js";
import ordersRoutes from "./routes/orders.js";
import billingRoutes from "./routes/billing.js";
import employeesRoutes from "./routes/employees.js";
import reportsRoutes from "./routes/reports.js";
import productionOrdersRoutes from "./routes/production-orders.js";
import salesOrdersRoutes from "./routes/sales-orders.js";
import notificationsRoutes from "./routes/notifications.js";
import {
  checkOverdueInvoices,
  checkUpcomingDueDates,
  checkCriticalStock,
  checkLowStockProducts,
  checkLowStockSupplies,
} from "./routes/notificationService.js";

// Register routes
app.use("/api/auth", authRoutes(pool));
app.use("/api/dashboard", dashboardRoutes(pool));
app.use("/api/inventory", inventoryRoutes(pool));
app.use("/api/products", productsRoutes(pool));
app.use("/api/supplies", suppliesRoutes(pool));
app.use("/api/suppliers", suppliersRoutes(pool));
app.use("/api/customers", customersRoutes(pool));
app.use("/api/orders", ordersRoutes(pool));
app.use("/api/billing", billingRoutes(pool));
app.use("/api/employees", employeesRoutes(pool));
app.use("/api/reports", reportsRoutes(pool));
app.use("/api/production-orders", productionOrdersRoutes(pool));
app.use("/api/sales-orders", salesOrdersRoutes(pool));
app.use("/api/notifications", notificationsRoutes(pool));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend está funcionando" });
});

// ===== FRONTEND SERVING (PRODUCTION) =====
// Servir archivos estáticos del frontend compilado
app.use(express.static(path.join(__dirname, "dist")));

// Redirect all non-API routes to index.html (for React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Función para inicializar la base de datos
async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    charset: "utf8mb4",
  });

  try {
    console.log("🔧 Inicializando base de datos...");

    // Crear base de datos si no existe (usar query en lugar de execute)
    try {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "pansoft_db"} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      console.log("  ✓ Base de datos lista");
    } catch (err) {
      console.warn("  ⚠️  Error al crear BD:", err.message);
    }

    // Seleccionar la base de datos
    try {
      await connection.query(`USE ${process.env.DB_NAME || "pansoft_db"}`);
    } catch (err) {
      console.warn("  ⚠️  Error al seleccionar BD:", err.message);
    }

    // Ejecutar archivos SQL críticos
    const sqlFiles = ["init.sql", "create_orders_tables.sql"];

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, "db", file);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, "utf-8");
        const queries = sql.split(";").filter((q) => q.trim());

        for (const query of queries) {
          if (query.trim()) {
            try {
              await connection.query(query);
            } catch (error) {
              // Ignorar errores de tablas que ya existen o referencias internas
              if (
                !error.message.includes("already exists") &&
                !error.message.includes("FOREIGN KEY constraint fails")
              ) {
                console.warn(`  ⚠️  ${file}: ${error.message}`);
              }
            }
          }
        }
      }
    }

    console.log("✓ Base de datos inicializada correctamente\n");

    // Asegurar que suppliers tiene las columnas is_active y category
    try {
      console.log("🔧 Verificando columnas de suppliers...");

      // Verificar y agregar is_active
      try {
        await connection.query(
          "ALTER TABLE suppliers ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
        );
        console.log("  ✓ Columna is_active agregada");
      } catch (err) {
        if (!err.message.includes("Duplicate column")) {
          console.warn("  ⚠️  Error con is_active:", err.message);
        }
      }

      // Verificar y agregar category
      try {
        await connection.query(
          "ALTER TABLE suppliers ADD COLUMN category VARCHAR(100)",
        );
        console.log("  ✓ Columna category agregada");
      } catch (err) {
        if (!err.message.includes("Duplicate column")) {
          console.warn("  ⚠️  Error con category:", err.message);
        }
      }

      // Actualizar registros NULL a activos
      await connection.query(
        "UPDATE suppliers SET is_active = TRUE WHERE is_active IS NULL",
      );
      console.log("  ✓ Suppliers verificados\n");

      // Migrar números de orden de SO- a VNT- (órdenes de venta antiguas)
      console.log("🔧 Migrando números de orden de venta (SO- a VNT-)...");
      try {
        const [soOrders] = await connection.query(
          "SELECT COUNT(*) as count FROM sales_orders WHERE order_number LIKE 'SO-%'",
        );
        if (soOrders[0]?.count > 0) {
          await connection.query(
            "UPDATE sales_orders SET order_number = CONCAT('VNT-', SUBSTRING(order_number, 4)) WHERE order_number LIKE 'SO-%'",
          );
          console.log(
            `  ✓ ${soOrders[0].count} órdenes de venta migradas de SO- a VNT-`,
          );
        }

        // Migrar órdenes sin año al nuevo formato VNT-YYYY-###
        const [oldFormatOrders] = await connection.query(
          "SELECT COUNT(*) as count FROM sales_orders WHERE order_number LIKE 'VNT-%' AND order_number NOT LIKE 'VNT-20%' AND order_number NOT LIKE 'VNT-21%'",
        );
        if (oldFormatOrders[0]?.count > 0) {
          await connection.query(`
            UPDATE sales_orders 
            SET order_number = CONCAT('VNT-', YEAR(order_date), '-', LPAD(SUBSTRING(order_number, 5), 3, '0'))
            WHERE order_number LIKE 'VNT-%' AND order_number NOT LIKE 'VNT-20%' AND order_number NOT LIKE 'VNT-21%'
          `);
          console.log(
            `  ✓ ${oldFormatOrders[0].count} órdenes de venta migradas al formato VNT-YYYY-###`,
          );
        }
      } catch (error) {
        console.warn("⚠️  No se pudo migrar órdenes de venta:", error.message);
      }
    } catch (error) {
      console.warn("⚠️  Error verificando suppliers:", error.message);
    }
  } catch (error) {
    console.error("⚠️  Error durante inicialización de BD:", error.message);
  } finally {
    await connection.end();
  }
}

// Inicializar BD y luego iniciar servidor
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor Pansoft ejecutándose en puerto ${PORT}`);

      // ===== TAREAS PROGRAMADAS DE NOTIFICACIONES =====
      console.log("⏰ Configurando tareas programadas de notificaciones...\n");

      // 1. Verificar facturas vencidas cada hora
      console.log("  ✓ Verificación de facturas vencidas cada hora");
      setInterval(() => {
        console.log("🔔 [Tarea] Verificando facturas vencidas...");
        checkOverdueInvoices(pool).catch((err) =>
          console.error(
            "❌ Error en verificación de facturas vencidas:",
            err.message,
          ),
        );
      }, 3600000); // 1 hora

      // Ejecutar en los primeros 30 segundos
      setTimeout(() => {
        console.log("🔔 [Tarea] Verificación inicial de facturas vencidas");
        checkOverdueInvoices(pool).catch((err) =>
          console.error("❌ Error:", err.message),
        );
      }, 30000);

      // 2. Verificar facturas próximas a vencer cada 12 horas
      console.log(
        "  ✓ Verificación de facturas próximas a vencer cada 12 horas",
      );
      setInterval(() => {
        console.log("🔔 [Tarea] Verificando facturas próximas a vencer...");
        checkUpcomingDueDates(pool, 3).catch((err) =>
          console.error(
            "❌ Error en verificación de próximas facturas:",
            err.message,
          ),
        );
      }, 43200000); // 12 horas

      // Ejecutar en los primeros 60 segundos
      setTimeout(() => {
        console.log("🔔 [Tarea] Verificación inicial de próximas facturas");
        checkUpcomingDueDates(pool, 3).catch((err) =>
          console.error("❌ Error:", err.message),
        );
      }, 60000);

      // 3. Verificar stock crítico cada 30 minutos
      console.log("  ✓ Verificación de stock crítico cada 30 minutos");
      setInterval(() => {
        console.log("🔔 [Tarea] Verificando stock crítico...");
        checkCriticalStock(pool).catch((err) =>
          console.error(
            "❌ Error en verificación de stock crítico:",
            err.message,
          ),
        );
      }, 1800000); // 30 minutos

      // Ejecutar en los primeros 90 segundos
      setTimeout(() => {
        console.log("🔔 [Tarea] Verificación inicial de stock crítico");
        checkCriticalStock(pool).catch((err) =>
          console.error("❌ Error:", err.message),
        );
      }, 90000);

      // 4. Verificar productos con stock bajo cada 45 minutos
      console.log(
        "  ✓ Verificación de productos con stock bajo cada 45 minutos",
      );
      setInterval(() => {
        console.log("🔔 [Tarea] Verificando productos con stock bajo...");
        checkLowStockProducts(pool).catch((err) =>
          console.error(
            "❌ Error en verificación de productos bajo stock:",
            err.message,
          ),
        );
      }, 2700000); // 45 minutos

      // Ejecutar en los primeros 120 segundos
      setTimeout(() => {
        console.log(
          "🔔 [Tarea] Verificación inicial de productos con stock bajo",
        );
        checkLowStockProducts(pool).catch((err) =>
          console.error("❌ Error:", err.message),
        );
      }, 120000);

      // 5. Verificar insumos con stock bajo cada 45 minutos
      console.log("  ✓ Verificación de insumos con stock bajo cada 45 minutos");
      setInterval(() => {
        console.log("🔔 [Tarea] Verificando insumos con stock bajo...");
        checkLowStockSupplies(pool).catch((err) =>
          console.error(
            "❌ Error en verificación de insumos bajo stock:",
            err.message,
          ),
        );
      }, 2700000); // 45 minutos

      // Ejecutar en los primeros 150 segundos
      setTimeout(() => {
        console.log(
          "🔔 [Tarea] Verificación inicial de insumos con stock bajo",
        );
        checkLowStockSupplies(pool).catch((err) =>
          console.error("❌ Error:", err.message),
        );
      }, 150000);

      console.log("\n✅ Tareas programadas configuradas correctamente\n");
    });
  } catch (error) {
    console.error("Error al iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();
