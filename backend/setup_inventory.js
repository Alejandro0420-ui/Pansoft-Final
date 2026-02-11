import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Cargar variables de entorno
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function setupInventory() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pansoft_db",
  });

  try {
    console.log("\n🔧 CONFIGURACIÓN COMPLETA DE INVENTARIO\n");
    console.log("=".repeat(50));

    // 1. Crear tabla inventory si no existe
    console.log("\n1️⃣  Verificando tabla 'inventory'...");
    try {
      await connection.query("DESCRIBE inventory");
      console.log("   ✅ Tabla inventory existe");
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        console.log("   📋 Creando tabla inventory...");
        await connection.query(`
          CREATE TABLE inventory (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL UNIQUE,
            warehouse_location VARCHAR(100) DEFAULT 'Almacén Principal',
            quantity INT DEFAULT 0,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
          ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        console.log("   ✅ Tabla inventory creada");
      } else {
        throw err;
      }
    }

    // 2. Crear tabla supplies_inventory si no existe
    console.log("\n2️⃣  Verificando tabla 'supplies_inventory'...");
    try {
      await connection.query("DESCRIBE supplies_inventory");
      console.log("   ✅ Tabla supplies_inventory existe");
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        console.log("   📋 Creando tabla supplies_inventory...");
        await connection.query(`
          CREATE TABLE supplies_inventory (
            id INT AUTO_INCREMENT PRIMARY KEY,
            supply_id INT NOT NULL UNIQUE,
            warehouse_location VARCHAR(100) DEFAULT 'Almacén Principal',
            quantity INT DEFAULT 0,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE
          ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        console.log("   ✅ Tabla supplies_inventory creada");
      } else {
        throw err;
      }
    }

    // 3. Contar registros en inventory
    console.log("\n3️⃣  Verificando datos en inventory...");
    const [[invCount]] = await connection.query(
      "SELECT COUNT(*) as count FROM inventory",
    );

    if (invCount.count === 0) {
      console.log("   📦 No hay registros. Insertando datos...");

      // Obtener todos los productos
      const [[productsCount]] = await connection.query(
        "SELECT COUNT(*) as count FROM products",
      );
      console.log(`   Encontrados ${productsCount.count} productos`);

      const [products] = await connection.query(
        "SELECT id FROM products LIMIT 100",
      );

      let inserted = 0;
      for (const product of products) {
        try {
          await connection.query(
            "INSERT INTO inventory (product_id, quantity, warehouse_location) VALUES (?, ?, ?)",
            [product.id, 100, "Almacén Principal"],
          );
          inserted++;
        } catch (err) {
          if (err.code === "ER_DUP_ENTRY") {
            // Ya existe, ignorar
          } else {
            console.error(
              `   ❌ Error insertando producto ${product.id}:`,
              err.message,
            );
          }
        }
      }
      console.log(`   ✅ Insertados ${inserted} registros de inventario`);
    } else {
      console.log(`   ✅ Existen ${invCount.count} registros de inventario`);

      // Mostrar ejemplo
      const [examples] = await connection.query(`
        SELECT i.id, i.product_id, p.name, i.quantity
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        LIMIT 5
      `);
      examples.forEach((ex) => {
        console.log(
          `      - Producto ID ${ex.product_id}: ${ex.name} (${ex.quantity} unidades)`,
        );
      });
    }

    // 4. Contar registros en supplies_inventory
    console.log("\n4️⃣  Verificando datos en supplies_inventory...");
    const [[supplyCount]] = await connection.query(
      "SELECT COUNT(*) as count FROM supplies_inventory",
    );

    if (supplyCount.count === 0) {
      console.log("   📦 No hay registros. Insertando datos...");

      const [supplies] = await connection.query(
        "SELECT id FROM supplies LIMIT 100",
      );

      let inserted = 0;
      for (const supply of supplies) {
        try {
          await connection.query(
            "INSERT INTO supplies_inventory (supply_id, quantity, warehouse_location) VALUES (?, ?, ?)",
            [supply.id, 500, "Almacén Principal"],
          );
          inserted++;
        } catch (err) {
          if (err.code === "ER_DUP_ENTRY") {
            // Ya existe, ignorar
          } else {
            console.error(
              `   ❌ Error insertando insumo ${supply.id}:`,
              err.message,
            );
          }
        }
      }
      console.log(
        `   ✅ Insertados ${inserted} registros de supplies_inventory`,
      );
    } else {
      console.log(
        `   ✅ Existen ${supplyCount.count} registros de supplies_inventory`,
      );
    }

    // 5. Crear tabla inventory_movements si no existe
    console.log("\n5️⃣  Verificando tabla 'inventory_movements'...");
    try {
      await connection.query("DESCRIBE inventory_movements");
      console.log("   ✅ Tabla inventory_movements existe");
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        console.log("   📋 Creando tabla inventory_movements...");
        await connection.query(`
          CREATE TABLE inventory_movements (
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
        console.log("   ✅ Tabla inventory_movements creada");
      } else {
        throw err;
      }
    }

    // 6. Crear tabla supplies_movements si no existe
    console.log("\n6️⃣  Verificando tabla 'supplies_movements'...");
    try {
      await connection.query("DESCRIBE supplies_movements");
      console.log("   ✅ Tabla supplies_movements existe");
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        console.log("   📋 Creando tabla supplies_movements...");
        await connection.query(`
          CREATE TABLE supplies_movements (
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
        console.log("   ✅ Tabla supplies_movements creada");
      } else {
        throw err;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("\n✨ CONFIGURACIÓN COMPLETADA\n");
    console.log("Ahora puedes:");
    console.log("  1. Reiniciar el servidor: npm start");
    console.log("  2. Registrar movimientos de inventario");
    console.log("  3. El historial se guardará automáticamente\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

setupInventory()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error crítico:", err);
    process.exit(1);
  });
