import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pansoft_db",
  });

  try {
    console.log("🗑️  Limpiando base de datos completamente...\n");

    // Desactivar FK checks para poder truncar
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    const tables = [
      "sales_order_insumos",
      "sales_order_items",
      "sales_orders",
      "production_order_insumos",
      "production_orders",
      "inventory",
      "employees",
      "customers",
      "products",
      "supplies",
    ];

    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`✓ TRUNCATE ${table}`);
    }

    // Reactivar FK checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("\n✨ Base de datos limpiada. Auto-increment resetado.");
    console.log("Ahora ejecuta: node seed_database.js\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

resetDatabase();
