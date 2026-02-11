import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Cargar variables de entorno
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function createInventoryTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pansoft_db",
  });

  try {
    console.log("🔄 Creando tablas de historial de inventario...");

    // Create inventory movements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución') NOT NULL,
        quantity_change INT NOT NULL,
        previous_quantity INT,
        new_quantity INT,
        reason VARCHAR(255),
        notes LONGTEXT,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_product_date (product_id, created_at),
        INDEX idx_movement_type (movement_type),
        INDEX idx_created_at (created_at)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    console.log("✅ Tabla inventory_movements creada");

    // Create supplies movements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS supplies_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supply_id INT NOT NULL,
        movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución') NOT NULL,
        quantity_change INT NOT NULL,
        previous_quantity INT,
        new_quantity INT,
        reason VARCHAR(255),
        notes LONGTEXT,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_supply_date (supply_id, created_at),
        INDEX idx_movement_type (movement_type),
        INDEX idx_created_at (created_at)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    console.log("✅ Tabla supplies_movements creada");
    console.log("✅ Migración completada exitosamente");

    await connection.end();
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    await connection.end();
    process.exit(1);
  }
}

createInventoryTables();
