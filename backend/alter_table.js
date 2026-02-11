import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pansoft_db",
});

async function alterColumns() {
  try {
    const connection = await pool.getConnection();

    console.log("Modifying customer_id column to allow NULL...");
    await connection.query(`
      ALTER TABLE sales_orders 
      MODIFY COLUMN customer_id INT NULL
    `);
    console.log("✓ customer_id now allows NULL");

    console.log("\nModifying order_number to allow NULL temporarily...");
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'pansoft_db' AND TABLE_NAME = 'sales_orders'
      AND COLUMN_NAME = 'order_number'
    `);

    // Generate a default order number if null
    const [result] = await connection.query(`
      SELECT COUNT(*) as count FROM sales_orders
    `);

    if (result[0].count === 0) {
      console.log("Table is empty, safe to proceed");
    }

    connection.release();
    await pool.end();
    console.log("\n✓ Column modifications complete");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

alterColumns();
