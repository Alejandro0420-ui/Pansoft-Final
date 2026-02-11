import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pansoft_db",
    charset: "utf8mb4",
  });

  try {
    console.log("🔄 Ejecutando migración de órdenes de venta...");

    // Verificar si customer_name ya existe
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'sales_orders' AND COLUMN_NAME = 'customer_name'
    `);

    if (columns.length === 0) {
      // Agregar customer_name si no existe
      await connection.query(`
        ALTER TABLE sales_orders 
        ADD COLUMN customer_name VARCHAR(100) AFTER customer_id
      `);
      console.log("✅ Column customer_name agregada");
    } else {
      console.log("✅ Column customer_name ya existe");
    }

    // Hacer customer_id nullable si aún no lo es
    const [constraints] = await connection.query(`
      SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'sales_orders' AND COLUMN_NAME = 'customer_id'
    `);

    // Verificar si customer_id es nullable
    const [columnInfo] = await connection.query(`
      SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'sales_orders' AND COLUMN_NAME = 'customer_id'
    `);

    if (columnInfo[0].IS_NULLABLE === "NO") {
      // Cambiar customer_id a nullable
      await connection.query(`
        ALTER TABLE sales_orders 
        MODIFY customer_id INT NULL
      `);
      console.log("✅ Column customer_id ahora es nullable");
    }

    // Crear índice si no existe
    const [indexes] = await connection.query(`
      SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_NAME = 'sales_orders' AND INDEX_NAME = 'idx_sales_orders_customer_name'
    `);

    if (indexes.length === 0) {
      await connection.query(`
        CREATE INDEX idx_sales_orders_customer_name ON sales_orders(customer_name)
      `);
      console.log("✅ Index idx_sales_orders_customer_name creado");
    }

    console.log("🎉 Migración completada exitosamente");
  } catch (error) {
    console.error("❌ Error en la migración:", error.message);
    if (error.code === "ER_DUP_KEYNAME") {
      console.log("ℹ️  El índice o constraint ya existe, continuando...");
    } else {
      throw error;
    }
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
