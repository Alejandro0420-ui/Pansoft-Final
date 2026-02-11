import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createTables() {
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

  try {
    console.log("Conectando a la base de datos...");
    const connection = await pool.getConnection();

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, "db", "create_orders_tables.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Dividir por punto y coma y ejecutar cada sentencia
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      console.log(`✓ Creando tabla...`);
      await connection.query(statement);
    }

    console.log("✓ Tablas creadas exitosamente");
    await connection.release();
  } catch (error) {
    console.error("Error al crear tablas:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTables();
