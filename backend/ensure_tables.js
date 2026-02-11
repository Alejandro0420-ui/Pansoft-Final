import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Cargar variables de entorno
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function ensureHistoryTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pansoft_db",
  });

  try {
    console.log("🔍 Verificando tablas de historial...");

    // Verificar tabla inventory_movements
    try {
      const [tables] = await connection.query(
        "SHOW TABLES LIKE 'inventory_movements'",
      );

      if (tables.length === 0) {
        console.log("📋 Creando tabla inventory_movements...");
        await connection.query(`
          CREATE TABLE IF NOT EXISTS inventory_movements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución') NOT NULL DEFAULT 'ajuste',
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
      } else {
        console.log("✅ Tabla inventory_movements ya existe");
      }
    } catch (error) {
      console.error("❌ Error con inventory_movements:", error.message);
      throw error;
    }

    // Verificar tabla supplies_movements
    try {
      const [tables] = await connection.query(
        "SHOW TABLES LIKE 'supplies_movements'",
      );

      if (tables.length === 0) {
        console.log("📋 Creando tabla supplies_movements...");
        await connection.query(`
          CREATE TABLE IF NOT EXISTS supplies_movements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            supply_id INT NOT NULL,
            movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución') NOT NULL DEFAULT 'ajuste',
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
      } else {
        console.log("✅ Tabla supplies_movements ya existe");
      }
    } catch (error) {
      console.error("❌ Error con supplies_movements:", error.message);
      throw error;
    }

    console.log("\n✨ Todas las tablas están listas");
    return true;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  } finally {
    await connection.end();
  }
}

ensureHistoryTables().then((success) => {
  process.exit(success ? 0 : 1);
});
