import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Cargar variables de entorno
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function diagnose() {
  let connection;
  try {
    const config = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "pansoft_db",
    };

    console.log("\n🔍 DIAGNÓSTICO DE INVENTARIO\n");
    console.log("=".repeat(60));

    console.log("\n📄 Configuración cargada:");
    console.log("   Host:", config.host);
    console.log("   User:", config.user);
    console.log("   Password:", config.password ? "***" : "(vacío)");
    console.log("   Database:", config.database);

    connection = await mysql.createConnection(config);

    console.log("\n1️⃣  CONEXIÓN:");
    console.log("   ✅ Conexión exitosa\n");

    // 2. Verificar tabla products
    console.log("2️⃣  TABLA 'PRODUCTS':");
    const [[productsCount]] = await connection.query(
      "SELECT COUNT(*) as count FROM products",
    );
    console.log(`   Total de productos: ${productsCount.count}`);

    if (productsCount.count > 0) {
      const [products] = await connection.query(
        "SELECT id, name FROM products LIMIT 3",
      );
      products.forEach((p) => {
        console.log(`   - ID: ${p.id}, Nombre: ${p.name}`);
      });
    }

    // 3. Verificar tabla inventory
    console.log("\n3️⃣  TABLA 'INVENTORY':");
    try {
      const [[invCount]] = await connection.query(
        "SELECT COUNT(*) as count FROM inventory",
      );
      console.log(`   Total de registros: ${invCount.count}`);

      if (invCount.count === 0) {
        console.log("   ⚠️  PROBLEMA: Tabla inventory VACÍA");
        console.log(
          "   Explicación: No hay datos de inventario para los productos",
        );
        console.log("   Solución: Ejecutar 'node setup_inventory.js'\n");
      } else {
        const [inv] = await connection.query(
          "SELECT i.id, i.product_id, p.name, i.quantity FROM inventory i LEFT JOIN products p ON i.product_id = p.id LIMIT 3",
        );
        inv.forEach((row) => {
          console.log(
            `   - ID: ${row.id}, Producto ID: ${row.product_id} (${row.name}), Cantidad: ${row.quantity}`,
          );
        });
      }
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        console.log("   ⚠️  PROBLEMA: Tabla 'inventory' NO EXISTE");
        console.log("   Solución: Ejecutar 'node setup_inventory.js'\n");
      } else {
        throw err;
      }
    }

    // 4. Verificar tabla inventario de insumos
    console.log("\n4️⃣  TABLA 'SUPPLIES_INVENTORY':");
    try {
      const [[supInvCount]] = await connection.query(
        "SELECT COUNT(*) as count FROM supplies_inventory",
      );
      console.log(`   Total de registros: ${supInvCount.count}`);
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        console.log("   ⚠️  Tabla NO existe");
      } else {
        throw err;
      }
    }

    // 5. Verificar tablas de historial
    console.log("\n5️⃣  TABLAS DE HISTORIAL:");
    try {
      const [[movCount]] = await connection.query(
        "SELECT COUNT(*) as count FROM inventory_movements",
      );
      console.log(
        `   ✅ inventory_movements existe (${movCount.count} registros)`,
      );
    } catch (err) {
      console.log("   ⚠️  inventory_movements NO existe");
    }

    try {
      const [[supMovCount]] = await connection.query(
        "SELECT COUNT(*) as count FROM supplies_movements",
      );
      console.log(
        `   ✅ supplies_movements existe (${supMovCount.count} registros)`,
      );
    } catch (err) {
      console.log("   ⚠️  supplies_movements NO existe");
    }

    // 6. Resumen
    console.log("\n" + "=".repeat(60));
    console.log("\n✨ PRÓXIMOS PASOS:\n");

    console.log("Ejecuta en orden:\n");
    console.log("1. node setup_inventory.js");
    console.log("2. npm start");
    console.log("3. Intenta registrar un movimiento\n");

    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Error de conexión:", error.message);
    console.error("\nVerifica:");
    console.error("  1. MySQL está corriendo");
    console.error("  2. Variables en .env son correctas");
    console.error("  3. Password es correcto\n");
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

diagnose()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
