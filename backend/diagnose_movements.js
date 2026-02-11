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

async function diagnose() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Conexión a BD exitosa\n");

    // 1. Verificar tabla inventory_movements
    console.log("1️⃣  Verificando tabla 'inventory_movements'...");
    try {
      const [columns1] = await connection.query(
        "DESCRIBE inventory_movements"
      );
      console.log("   ✅ Tabla existe");
      console.log("   Columnas:", columns1.map((c) => c.Field).join(", "));

      const [[count1]] = await connection.query(
        "SELECT COUNT(*) as total FROM inventory_movements"
      );
      console.log(`   📊 Registros: ${count1.total}\n`);
    } catch (e) {
      console.log("   ❌ Tabla NO existe\n");
    }

    // 2. Verificar tabla supplies_movements
    console.log("2️⃣  Verificando tabla 'supplies_movements'...");
    try {
      const [columns2] = await connection.query(
        "DESCRIBE supplies_movements"
      );
      console.log("   ✅ Tabla existe");
      console.log("   Columnas:", columns2.map((c) => c.Field).join(", "));

      const [[count2]] = await connection.query(
        "SELECT COUNT(*) as total FROM supplies_movements"
      );
      console.log(`   📊 Registros: ${count2.total}\n`);
    } catch (e) {
      console.log("   ❌ Tabla NO existe\n");
    }

    // 3. Listar últimos movimientos de inventario
    console.log("3️⃣  Últimos movimientos de PRODUCTOS:");
    try {
      const [movements1] = await connection.query(
        `SELECT 
          im.id, p.name, im.quantity_change, 
          im.previous_quantity, im.new_quantity,
          im.movement_type, im.created_at
        FROM inventory_movements im
        JOIN products p ON im.product_id = p.id
        ORDER BY im.created_at DESC
        LIMIT 5`
      );
      
      if (movements1.length === 0) {
        console.log("   ℹ️  No hay movimientos registrados");
      } else {
        movements1.forEach((m) => {
          console.log(
            `   • ${m.name}: ${m.quantity_change > 0 ? "+" : ""}${m.quantity_change} ` +
            `(${m.previous_quantity} → ${m.new_quantity}) [${m.movement_type}] - ${m.created_at}`
          );
        });
      }
    } catch (e) {
      console.log("   ⚠️  Error consultando:", e.message);
    }
    console.log();

    // 4. Listar últimos movimientos de supplies
    console.log("4️⃣  Últimos movimientos de SUPPLIES:");
    try {
      const [movements2] = await connection.query(
        `SELECT 
          sm.id, s.name, sm.quantity_change,
          sm.previous_quantity, sm.new_quantity, 
          sm.movement_type, sm.created_at
        FROM supplies_movements sm
        JOIN supplies s ON sm.supply_id = s.id
        ORDER BY sm.created_at DESC
        LIMIT 5`
      );

      if (movements2.length === 0) {
        console.log("   ℹ️  No hay movimientos registrados");
      } else {
        movements2.forEach((m) => {
          console.log(
            `   • ${m.name}: ${m.quantity_change > 0 ? "+" : ""}${m.quantity_change} ` +
            `(${m.previous_quantity} → ${m.new_quantity}) [${m.movement_type}] - ${m.created_at}`
          );
        });
      }
    } catch (e) {
      console.log("   ⚠️  Error consultando:", e.message);
    }
    console.log();

    // 5. Verificar si hay relación con tabla users
    console.log("5️⃣  Verificando tabla 'users'...");
    try {
      const [[users]] = await connection.query("SELECT COUNT(*) as total FROM users");
      console.log(`   ✅ Tabla users existe (${users.total} usuarios)\n`);
    } catch (e) {
      console.log("   ⚠️  Tabla users NO existe\n");
    }

    console.log("✅ Diagnóstico completo");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) await connection.release();
    process.exit(0);
  }
}

diagnose();
