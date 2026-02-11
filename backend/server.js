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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend está funcionando" });
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
    });
  } catch (error) {
    console.error("Error al iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();
