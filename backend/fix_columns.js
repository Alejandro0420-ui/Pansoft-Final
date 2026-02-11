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
});

async function addMissingColumns() {
  try {
    const connection = await pool.getConnection();

    console.log("Checking and adding missing columns...");

    // Check if customer_name column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sales_orders' AND COLUMN_NAME = 'customer_name'`,
      [process.env.DB_NAME || "pansoft_db"],
    );

    if (columns.length === 0) {
      console.log("Adding customer_name column to sales_orders...");
      await connection.query(
        `ALTER TABLE sales_orders ADD COLUMN customer_name VARCHAR(100) AFTER customer_id`,
      );
      console.log("✓ customer_name column added");
    } else {
      console.log("✓ customer_name column already exists");
    }

    // Check production_orders table as well
    const [prodColumns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'production_orders'`,
      [process.env.DB_NAME || "pansoft_db"],
    );

    console.log(
      "Columns in production_orders:",
      prodColumns.map((c) => c.COLUMN_NAME).join(", "),
    );

    connection.release();
    await pool.end();
    console.log("\n✓ Database verification complete");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

addMissingColumns();
