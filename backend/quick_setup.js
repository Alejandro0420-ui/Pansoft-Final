import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function quickSetup() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "pansoft_db",
    });

    console.log("\n🚀 SETUP RÁPIDO DE INVENTARIO\n");

    // 1. Crear tabla inventory_movements
    console.log("1️⃣  Tabla inventory_movements...");
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS inventory_movements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución') DEFAULT 'ajuste',
          quantity_change INT NOT NULL,
          previous_quantity INT,
          new_quantity INT,
          reason VARCHAR(255),
          notes LONGTEXT,
          user_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          INDEX idx_product (product_id),
          INDEX idx_date (created_at)
        ) CHARACTER SET utf8mb4
      `);
      console.log("   ✅ Tabla creada/existe");
    } catch (err) {
      console.error("   ❌ Error:", err.message);
      throw err;
    }

    // 2. Crear tabla supplies_movements
    console.log("\n2️⃣  Tabla supplies_movements...");
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS supplies_movements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          supply_id INT NOT NULL,
          movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución') DEFAULT 'ajuste',
          quantity_change INT NOT NULL,
          previous_quantity INT,
          new_quantity INT,
          reason VARCHAR(255),
          notes LONGTEXT,
          user_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE,
          INDEX idx_supply (supply_id),
          INDEX idx_date (created_at)
        ) CHARACTER SET utf8mb4
      `);
      console.log("   ✅ Tabla creada/existe");
    } catch (err) {
      console.error("   ❌ Error:", err.message);
      throw err;
    }

    // 3. Crear tabla inventory si no existe
    console.log("\n3️⃣  Tabla inventory...");
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL UNIQUE,
          warehouse_location VARCHAR(100) DEFAULT 'Almacén Principal',
          quantity INT DEFAULT 0,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) CHARACTER SET utf8mb4
      `);
      console.log("   ✅ Tabla creada/existe");
    } catch (err) {
      console.error("   ❌ Error:", err.message);
    }

    // 4. Crear tabla supplies_inventory si no existe
    console.log("\n4️⃣  Tabla supplies_inventory...");
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS supplies_inventory (
          id INT AUTO_INCREMENT PRIMARY KEY,
          supply_id INT NOT NULL UNIQUE,
          warehouse_location VARCHAR(100) DEFAULT 'Almacén Principal',
          quantity INT DEFAULT 0,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE
        ) CHARACTER SET utf8mb4
      `);
      console.log("   ✅ Tabla creada/existe");
    } catch (err) {
      console.error("   ❌ Error:", err.message);
    }

    // 5. Poblar inventory si está vacía
    console.log("\n5️⃣  Insertando datos en inventory...");
    try {
      const [[{ count }]] = await connection.query(
        "SELECT COUNT(*) as count FROM inventory",
      );

      if (count === 0) {
        console.log("   📦 Tabla vacía, insertando productos...");
        const [products] = await connection.query(
          "SELECT id FROM products LIMIT 100",
        );

        let inserted = 0;
        for (const product of products) {
          try {
            await connection.query(
              "INSERT INTO inventory (product_id, quantity) VALUES (?, ?)",
              [product.id, 100],
            );
            inserted++;
          } catch (err) {
            // Ignorar duplicados
          }
        }
        console.log(`   ✅ Insertados ${inserted} productos`);
      } else {
        console.log(`   ✅ Ya existen ${count} registros`);
      }
    } catch (err) {
      console.log("   ℹ️  Tabla inventory o products no existen aún");
    }

    console.log("\n✨ ¡SETUP COMPLETADO!\n");
    console.log("Próximos pasos:");
    console.log("  npm start");
    console.log("  Intenta registrar un movimiento\n");
  } catch (error) {
    console.error("\n❌ Error crítico:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickSetup().then(() => process.exit(0));
