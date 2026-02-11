import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function checkData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pansoft_db",
    charset: "utf8mb4",
  });

  try {
    console.log("=== TABLE SCHEMA ===");
    const [schema] = await connection.query(`DESCRIBE sales_orders`);
    console.table(schema);

    console.log("\n=== Testing SELECT * ===");
    const [result] = await connection.query(`SELECT * FROM sales_orders`);
    console.log("Rows returned:", result.length);

    console.log("\n=== Testing SELECT with alias ===");
    try {
      const [resultAlias] = await connection.query(`
        SELECT so.id, so.order_number 
        FROM sales_orders so
      `);
      console.log("✓ Alias query works:", resultAlias.length, "rows");
    } catch (err) {
      console.error("✗ Alias query failed:", err.message);
    }

    console.log("\n✓ Check complete");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkData();
