import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pansoft_db",
  charset: "utf8mb4",
});

async function syncInventory() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("🔧 Sincronizando inventario...\n");

    // 1. Para cada producto con inventario, sincronizar stock
    console.log("1️⃣  Sincronizando products.stock_quantity con inventory.quantity...");
    const [products] = await connection.query(
      "SELECT p.id, p.stock_quantity, i.quantity FROM products p LEFT JOIN inventory i ON p.id = i.product_id"
    );

    let syncCount = 0;
    for (const product of products) {
      const currentStock = product.stock_quantity;
      const inventoryStock = product.quantity;

      if (inventoryStock !== null && currentStock !== inventoryStock) {
        console.log(
          `   📦 Producto ${product.id}: products=${currentStock}, inventory=${inventoryStock}`
        );

        // Actualizar a la cantidad de inventory (que es la más actualizada)
        await connection.query(
          "UPDATE products SET stock_quantity = ? WHERE id = ?",
          [inventoryStock, product.id]
        );
        syncCount++;
      }
    }

    if (syncCount > 0) {
      console.log(`   ✅ ${syncCount} productos sincronizados\n`);
    } else {
      console.log(`   ✅ Todo sincronizado correctamente\n`);
    }

    // 2. Verificar movimientos con quantity_change = 0
    console.log("2️⃣  Revisando movimientos con quantity_change = 0...");
    const [[movementCount]] = await connection.query(
      "SELECT COUNT(*) as count FROM inventory_movements WHERE quantity_change = 0"
    );

    if (movementCount.count > 0) {
      console.log(`   ⚠️  Encontrados ${movementCount.count} movimientos con quantity_change = 0`);
      console.log(`   📋 Mostrando últimos 5:\n`);

      const [movements] = await connection.query(
        `SELECT 
          im.id, p.name, im.previous_quantity, im.new_quantity, im.quantity_change, im.created_at
        FROM inventory_movements im
        JOIN products p ON im.product_id = p.id
        WHERE im.quantity_change = 0
        ORDER BY im.created_at DESC
        LIMIT 5`
      );

      movements.forEach((m) => {
        console.log(
          `      • ${m.name}: ${m.previous_quantity} → ${m.new_quantity} (cambio=0)`
        );
      });

      console.log("\n      🔧 Corrigiendo quantity_change...");
      await connection.query(
        `UPDATE inventory_movements 
        SET quantity_change = new_quantity - previous_quantity 
        WHERE quantity_change = 0`
      );
      console.log(`   ✅ Corregidos ${movementCount.count} movimientos\n`);
    } else {
      console.log(`   ✅ No hay movimientos con quantity_change = 0\n`);
    }

    // 3. Resumen final
    console.log("3️⃣  Resumen final:");
    const [[totalMovements]] = await connection.query(
      "SELECT COUNT(*) as total FROM inventory_movements"
    );
    console.log(`   📊 Total movimientos: ${totalMovements.total}`);

    const [[totalProducts]] = await connection.query(
      "SELECT COUNT(*) as total FROM products WHERE stock_quantity > 0"
    );
    console.log(`   📦 Productos con stock: ${totalProducts.total}`);

    console.log("\n✅ Sincronización completada");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) await connection.release();
    process.exit(0);
  }
}

syncInventory();
