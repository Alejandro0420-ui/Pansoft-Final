import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

async function testInventoryEndpoint() {
  let connection;
  try {
    console.log("🔍 Probando endpoint de historial de inventario...\n");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "pansoft_db",
    });

    console.log("✅ Conectado a MySQL\n");

    // Test 1: Check if inventory_movements table exists
    console.log("1️⃣  Verificando tabla inventory_movements...");
    try {
      const [result] = await connection.query("DESCRIBE inventory_movements");
      console.log("✅ Tabla EXISTS\n");
      console.log("Estructura:");
      result.forEach((col) => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
      console.log();
    } catch (err) {
      console.error(`❌ Error: ${err.message}\n`);
      return;
    }

    // Test 2: Check if products table exists
    console.log("2️⃣  Verificando tabla products...");
    const [productsCheck] = await connection.query("DESCRIBE products");
    console.log("✅ Tabla products existe\n");

    // Test 3: Check if users table exists
    console.log("3️⃣  Verificando tabla users...");
    const [usersCheck] = await connection.query("DESCRIBE users");
    console.log("✅ Tabla users existe\n");

    // Test 4: Count records in inventory_movements
    console.log("4️⃣  Contando registros en inventory_movements...");
    const [[count]] = await connection.query(
      "SELECT COUNT(*) as total FROM inventory_movements",
    );
    console.log(`Total de movimientos: ${count.total}\n`);

    // Test 5: Try the actual query from the endpoint
    console.log("5️⃣  Ejecutando query del endpoint...");
    try {
      const [movements] = await connection.query(`
        SELECT 
          im.id,
          im.product_id,
          p.name as product_name,
          p.sku,
          im.movement_type,
          im.quantity_change,
          im.previous_quantity,
          im.new_quantity,
          im.reason,
          im.notes,
          u.full_name as user_name,
          im.created_at
        FROM inventory_movements im
        JOIN products p ON im.product_id = p.id
        LEFT JOIN users u ON im.user_id = u.id
        ORDER BY im.created_at DESC
        LIMIT 100 OFFSET 0
      `);

      console.log(
        `✅ Query exitosa! Encontrados ${movements.length} movimientos\n`,
      );

      if (movements.length > 0) {
        console.log("Primeros 3 movimientos:");
        movements.slice(0, 3).forEach((m, idx) => {
          console.log(
            `  ${idx + 1}. ${m.product_name} (${m.movement_type}): ${m.quantity_change} unidades`,
          );
        });
      } else {
        console.log("No hay movimientos registrados aún");
      }
    } catch (queryError) {
      console.error(`❌ Error en query: ${queryError.message}`);
      console.error(`Error code: ${queryError.code}`);
      if (queryError.sql) {
        console.error(`SQL: ${queryError.sql}`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testInventoryEndpoint();
