import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Cargar variables de entorno
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function checkInventoryData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pansoft_db",
  });

  try {
    console.log("🔍 Verificando datos de inventario...\n");

    // Ver estructura de la tabla inventory
    console.log("📋 Estructura de tabla 'inventory':");
    const [structure] = await connection.query("DESCRIBE inventory");
    structure.forEach((col) => {
      console.log(
        `   - ${col.Field}: ${col.Type} ${col.Null === "NO" ? "NOT NULL" : ""}`,
      );
    });

    // Ver registros en inventory
    console.log("\n📊 Registros en 'inventory':");
    const [inventoryData] = await connection.query(`
      SELECT i.*, p.name, p.sku
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.id
      LIMIT 10
    `);

    if (inventoryData.length === 0) {
      console.log("   ❌ No hay registros en inventory");
      console.log(
        "\n📌 Necesitas crear registros de inventario para los productos",
      );

      // Ver productos disponibles
      console.log("\n📦 Productos disponibles:");
      const [products] = await connection.query(
        "SELECT id, name, sku FROM products LIMIT 10",
      );
      products.forEach((p) => {
        console.log(`   - ID: ${p.id}, Nombre: ${p.name}, SKU: ${p.sku}`);
      });

      // Crear inventario para productos
      console.log("\n🔧 Creando inventario automático...");
      const [allProducts] = await connection.query("SELECT id FROM products");

      for (const product of allProducts) {
        try {
          await connection.query(
            "INSERT INTO inventory (product_id, quantity, warehouse_location) VALUES (?, ?, ?)",
            [product.id, 100, "Almacén A"],
          );
          console.log(`   ✅ Inventario creado para producto ID ${product.id}`);
        } catch (err) {
          // Ya existe, ignorar
        }
      }
    } else {
      console.log(`   ✅ Encontrados ${inventoryData.length} registros`);
      inventoryData.forEach((row) => {
        console.log(
          `   - ID: ${row.id}, Producto: ${row.name}, Cantidad: ${row.quantity}`,
        );
      });
    }

    // Ver tabla supplies_inventory
    console.log("\n📦 Verificando tabla supplies_inventory...");
    try {
      const [suppliesInv] = await connection.query(
        "SELECT COUNT(*) as count FROM supplies_inventory",
      );
      console.log(
        `   ✅ Registros en supplies_inventory: ${suppliesInv[0].count}`,
      );

      if (suppliesInv[0].count === 0) {
        console.log("   🔧 Creando inventario para insumos...");
        const [supplies] = await connection.query("SELECT id FROM supplies");

        for (const supply of supplies) {
          try {
            await connection.query(
              "INSERT INTO supplies_inventory (supply_id, quantity, warehouse_location) VALUES (?, ?, ?)",
              [supply.id, 500, "Almacén B"],
            );
            console.log(`   ✅ Inventario creado para insumo ID ${supply.id}`);
          } catch (err) {
            // Ya existe, ignorar
          }
        }
      }
    } catch (err) {
      console.log("   ℹ️  Tabla supplies_inventory no existe (opcional)");
    }

    console.log("\n✨ Verificación completada");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkInventoryData();
