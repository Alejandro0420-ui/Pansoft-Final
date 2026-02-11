import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

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

async function runMigration() {
  const connection = await pool.getConnection();

  try {
    console.log("Iniciando migración...");

    console.log("Agregando columna is_active a la tabla products...");
    await connection.execute(
      "ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
    );
    console.log("✓ Columna is_active agregada a products");

    console.log("Agregando columna is_active a la tabla supplies...");
    await connection.execute(
      "ALTER TABLE supplies ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
    );
    console.log("✓ Columna is_active agregada a supplies");

    console.log("✓ Migración completada exitosamente");
  } catch (error) {
    // Check if error is about column already existing
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("ℹ️  Las columnas is_active ya existen en las tablas");
    } else {
      console.error("✗ Error durante la migración:", error.message);
    }
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigration();
