import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  console.log("📋 Configuración de conexión:");
  console.log(`   Host: ${process.env.DB_HOST || "localhost"}`);
  console.log(`   User: ${process.env.DB_USER || "root"}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? "***" : "(empty)"}`);
  console.log(`   Database: ${process.env.DB_NAME || "pansoft_db"}\n`);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pansoft_db",
  });

  try {
    console.log("🌱 Iniciando proceso de seeding...\n");

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, "db", "seed_data_modern.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Ejecutar el script SQL - separar por ; y limpiar comentarios de línea
    const statements = sql
      .split(";")
      .map((stmt) => {
        // Remover comentarios de línea (--) pero mantener el statement
        return stmt
          .split("\n")
          .filter((line) => !line.trim().startsWith("--"))
          .join("\n")
          .trim();
      })
      .filter((stmt) => stmt.length > 0);

    let count = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const trimmed = statement.trim();
          console.log(`✓ ${trimmed.substring(0, 70).padEnd(70, ".")}`);
          await connection.query(trimmed);
          count++;
        } catch (err) {
          if (
            err.message.includes("Table") ||
            err.message.includes("Duplicate")
          ) {
            console.log(`  ⚠️ ${err.message.substring(0, 60)}`);
          } else {
            console.error(`  ❌ ${err.message}`);
          }
        }
      }
    }

    console.log(`\n✨ Seeding completado (${count} statements ejecutados)!\n`);
    console.log("📊 Resumen de datos:");

    // Mostrar conteos
    const [products] = await connection.query(
      "SELECT COUNT(*) as count FROM products",
    );
    const [customers] = await connection.query(
      "SELECT COUNT(*) as count FROM customers",
    );
    const [employees] = await connection.query(
      "SELECT COUNT(*) as count FROM employees",
    );
    const [salesOrders] = await connection.query(
      "SELECT COUNT(*) as count FROM sales_orders",
    );
    const [productionOrders] = await connection.query(
      "SELECT COUNT(*) as count FROM production_orders",
    );
    const [supplies] = await connection.query(
      "SELECT COUNT(*) as count FROM supplies",
    );

    console.log(`   ✅ Productos: ${products[0].count}`);
    console.log(`   ✅ Clientes: ${customers[0].count}`);
    console.log(`   ✅ Empleados: ${employees[0].count}`);
    console.log(`   ✅ Órdenes de Venta: ${salesOrders[0].count}`);
    console.log(`   ✅ Órdenes de Producción: ${productionOrders[0].count}`);
    console.log(`   ✅ Insumos: ${supplies[0].count}`);

    console.log("\n🎉 ¡Base de datos lista para usar!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
