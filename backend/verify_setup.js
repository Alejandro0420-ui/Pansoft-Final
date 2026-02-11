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

async function verify() {
  const connection = await pool.getConnection();

  try {
    console.log("🔍 VERIFICACIÓN DE BASE DE DATOS\n");
    console.log("=".repeat(60) + "\n");

    // Verificar charset
    const [[dbInfo]] = await connection.execute(
      "SELECT DEFAULT_CHARACTER_SET_NAME as charset, DEFAULT_COLLATION_NAME as collation FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
      ["pansoft_db"],
    );
    console.log("📊 CONFIGURACIÓN:");
    console.log(`   Charset: ${dbInfo.charset}`);
    console.log(`   Collation: ${dbInfo.collation}\n`);

    // Listar tablas
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'pansoft_db'",
    );

    console.log("📋 TABLAS DISPONIBLES:\n");

    for (const { TABLE_NAME } of tables) {
      const [[{ count }]] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${TABLE_NAME}`,
      );
      console.log(`   • ${TABLE_NAME}: ${count} registros`);
    }

    console.log(`\n${"=".repeat(60)}\n`);

    // Mostrar muestra de datos en cada tabla principal
    console.log("📚 MUESTRAS DE DATOS:\n");

    // Users
    console.log("👤 USUARIOS (primeros 3):");
    const [users] = await connection.execute(
      "SELECT id, username, full_name FROM users LIMIT 3",
    );
    users.forEach((u) => {
      console.log(`   - ${u.username} (${u.full_name})`);
    });

    // Products
    console.log("\n🍞 PRODUCTOS (primeros 5):");
    const [products] = await connection.execute(
      "SELECT id, name, category FROM products LIMIT 5",
    );
    products.forEach((p) => {
      console.log(`   - ${p.name} (${p.category})`);
    });

    // Customers
    console.log("\n👥 CLIENTES (primeros 3):");
    const [customers] = await connection.execute(
      "SELECT id, name, city FROM customers LIMIT 3",
    );
    customers.forEach((c) => {
      console.log(`   - ${c.name} (${c.city})`);
    });

    // Suppliers
    console.log("\n🏭 PROVEEDORES (primeros 3):");
    const [suppliers] = await connection.execute(
      "SELECT id, company_name, city FROM suppliers LIMIT 3",
    );
    suppliers.forEach((s) => {
      console.log(`   - ${s.company_name} (${s.city})`);
    });

    console.log(`\n${"=".repeat(60)}`);
    console.log("\n✅ BASE DE DATOS LISTA PARA USAR\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

verify();
