import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("DB Config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? "***" : "empty",
  database: process.env.DB_NAME,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pansoft_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkAndFixTables() {
  try {
    const connection = await pool.getConnection();

    // Check if sales_orders table exists
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sales_orders'`,
      [process.env.DB_NAME || "pansoft_db"],
    );

    console.log("Checking sales_orders table...");

    if (tables.length === 0) {
      console.log("❌ sales_orders table not found. Creating tables...");

      // Read SQL file
      const sqlFile = path.join(__dirname, "db", "create_orders_tables.sql");
      const sql = fs.readFileSync(sqlFile, "utf8");

      // Split and execute each statement
      const statements = sql
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt && !stmt.startsWith("--"));

      for (const statement of statements) {
        try {
          await connection.query(statement);
          console.log("✓ Executed:", statement.substring(0, 50) + "...");
        } catch (error) {
          console.error(
            "Error executing statement:",
            statement.substring(0, 50),
          );
          console.error(error.message);
        }
      }

      console.log("✓ Tables created successfully");
    } else {
      console.log("✓ sales_orders table exists");

      // Check columns
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sales_orders'`,
        [process.env.DB_NAME || "pansoft_db"],
      );

      console.log(
        "Columns in sales_orders:",
        columns.map((c) => c.COLUMN_NAME).join(", "),
      );
    }

    connection.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkAndFixTables();
