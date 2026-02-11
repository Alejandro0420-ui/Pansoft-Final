import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    charset: "utf8mb4",
  });

  try {
    console.log("🔧 INICIALIZANDO BASE DE DATOS...\n");

    // Crear base de datos si no existe
    console.log("📦 Creando base de datos si no existe...");
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "pansoft_db"} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log("✓ Base de datos lista\n");

    // Seleccionar la base de datos
    await connection.execute(`USE ${process.env.DB_NAME || "pansoft_db"}`);

    // Leer y ejecutar archivos SQL en orden
    const sqlFiles = ["init.sql", "create_orders_tables.sql", "mysql_seed.sql"];

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, "db", file);
      if (fs.existsSync(filePath)) {
        console.log(`📄 Ejecutando ${file}...`);
        const sql = fs.readFileSync(filePath, "utf-8");
        const queries = sql.split(";").filter((q) => q.trim());

        for (const query of queries) {
          if (query.trim()) {
            try {
              await connection.execute(query);
            } catch (error) {
              // Ignorar errores de tablas que ya existen
              if (!error.message.includes("already exists")) {
                console.warn(`  ⚠️  ${error.message}`);
              }
            }
          }
        }
        console.log(`✓ ${file} completado\n`);
      }
    }

    // Verificar tablas críticas
    console.log("🔍 Verificando tablas...\n");
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.DB_NAME || "pansoft_db"],
    );

    const tableNames = tables.map((t) => t.TABLE_NAME);
    const criticalTables = [
      "sales_orders",
      "production_orders",
      "products",
      "customers",
      "employees",
    ];

    console.log("📋 Tablas encontradas:");
    for (const table of criticalTables) {
      const exists = tableNames.includes(table);
      console.log(`   ${exists ? "✓" : "✗"} ${table}`);
    }

    console.log("\n✅ INICIALIZACIÓN COMPLETADA\n");
  } catch (error) {
    console.error("❌ Error durante inicialización:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initializeDatabase();
