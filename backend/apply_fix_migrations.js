import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "pansoft_db";

async function applyFixMigrations() {
  let connection;

  try {
    console.log("🔧 Iniciando aplicación de migraciones de corrección...\n");

    // Crear pool de conexión
    const pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
    });

    connection = await pool.getConnection();

    console.log("✓ Conectado a la base de datos\n");

    // Ejecutar las migraciones
    console.log("📌 Aplicando migraciones de corrección...");

    // 1. Agregar columna customer_name a sales_orders
    try {
      const [result] = await connection.execute(
        "DESCRIBE sales_orders customer_name"
      );
      console.log("ℹ️  sales_orders ya tiene la columna customer_name");
    } catch (error) {
      if (error.code === "ER_NO_SUCH_TABLE" || error.errno === 1054) {
        // Columna no existe, agregarla
        await connection.execute(
          "ALTER TABLE sales_orders ADD COLUMN customer_name VARCHAR(100) DEFAULT '' AFTER customer_id"
        );
        console.log("✓ Columna customer_name agregada a sales_orders");
      } else {
        throw error;
      }
    }

    // 2. Agregar columna customer_name a production_orders
    try {
      const [result] = await connection.execute(
        "DESCRIBE production_orders customer_name"
      );
      console.log("ℹ️  production_orders ya tiene la columna customer_name");
    } catch (error) {
      if (error.code === "ER_NO_SUCH_TABLE" || error.errno === 1054) {
        // Columna no existe, agregarla
        await connection.execute(
          "ALTER TABLE production_orders ADD COLUMN customer_name VARCHAR(100) DEFAULT '' AFTER quantity"
        );
        console.log("✓ Columna customer_name agregada a production_orders");
      } else {
        throw error;
      }
    }

    // 3. Verificar si la columna notes existe en sales_orders
    try {
      const [result] = await connection.execute(
        "DESCRIBE sales_orders notes"
      );
      console.log("ℹ️  sales_orders ya tiene la columna notes");
    } catch (error) {
      if (error.code === "ER_NO_SUCH_TABLE" || error.errno === 1054) {
        // Columna no existe, agregarla
        await connection.execute(
          "ALTER TABLE sales_orders ADD COLUMN notes TEXT DEFAULT '' AFTER status"
        );
        console.log("✓ Columna notes agregada a sales_orders");
      } else {
        throw error;
      }
    }

    // 4. Agregar índice para customer_name en sales_orders
    try {
      await connection.execute(
        "CREATE INDEX idx_sales_orders_customer_name ON sales_orders(customer_name)"
      );
      console.log("✓ Índice creado para customer_name en sales_orders");
    } catch (error) {
      if (error.code === "ER_DUP_KEYNAME") {
        console.log("ℹ️  Índice ya existe en sales_orders");
      } else {
        console.warn("⚠️  No se pudo crear el índice:", error.message);
      }
    }

    // 5. Verificar que las órdenes con customer_null se actualicen
    try {
      const [[orderCount]] = await connection.execute(
        "SELECT COUNT(*) as count FROM sales_orders WHERE customer_name IS NULL OR customer_name = ''"
      );
      if (orderCount.count > 0) {
        console.log(`⚠️  ${orderCount.count} órdenes sin nombre de cliente detectadas`);
      }
    } catch (error) {
      // Silenciosamente ignorar
    }

    console.log("\n✅ ¡Migraciones aplicadas correctamente!");
    console.log("🎯 Reinicia el servidor para aplicar los cambios\n");

    connection.release();
    await pool.end();
  } catch (error) {
    console.error("\n❌ Error durante la aplicación de migraciones:");
    console.error(error.message);
    if (connection) connection.release();
    process.exit(1);
  }
}

applyFixMigrations();
