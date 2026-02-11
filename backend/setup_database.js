import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "pansoft_db";

// Conexión sin especificar base de datos (para crear la BD)
const rootPool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  charset: "utf8mb4",
});

async function executeSQLFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");

  // Dividir por punto y coma y limpiar comentarios
  const statements = sql
    .split(";")
    .map((stmt) => {
      // Remover comentarios de línea
      return stmt
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim();
    })
    .filter((stmt) => stmt.length > 0);

  let successCount = 0;

  for (const statement of statements) {
    try {
      const upperStmt = statement.toUpperCase().trim();

      // Saltar USE
      if (upperStmt.startsWith("USE")) {
        continue;
      }

      await connection.execute(statement);
      successCount++;
    } catch (error) {
      // Ignorar errores de duplicados
      if (
        error.code === "ER_DUP_FIELDNAME" ||
        error.code === "ER_TABLE_EXISTS_ERROR" ||
        error.code === "ER_DUP_ENTRY"
      ) {
        // Ignorar silenciosamente
      } else if (error.code === "ER_NO_REFERENCED_TABLE") {
        // Puede ocurrir por orden de creación
      } else {
        console.error(`⚠️  Error inesperado:`, error.message.substring(0, 100));
      }
    }
  }

  return successCount;
}

async function setupDatabase() {
  let rootConnection;
  let appConnection;
  let appPool;

  try {
    console.log("🔧 Iniciando configuración de base de datos...\n");

    // Paso 1: Conectar como root para eliminar y crear BD
    console.log("📌 Paso 1: Eliminando base de datos anterior...");
    rootConnection = await rootPool.getConnection();

    try {
      await rootConnection.execute(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
      console.log("✓ Base de datos eliminada\n");
    } catch (error) {
      console.log("ℹ️  Base de datos no existía o no pudo eliminarse\n");
    }

    // Paso 2: Crear base de datos
    console.log("📌 Paso 2: Creando nueva base de datos con UTF-8...");
    await rootConnection.execute(
      `CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`✓ Base de datos '${DB_NAME}' creada con charset utf8mb4\n`);

    rootConnection.release();
    await rootPool.end();

    // Crear nuevo pool apuntando a la BD
    appPool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
    });

    // Paso 3: Ejecutar script de inicialización
    console.log("📌 Paso 3: Ejecutando script de inicialización...");

    appConnection = await appPool.getConnection();

    const initPath = path.join(__dirname, "db", "mysql_init.sql");
    const createCount = await executeSQLFile(appConnection, initPath);
    console.log(`✓ Tablas creadas (${createCount} statements ejecutados)\n`);

    // Paso 4: Insertar datos de prueba
    console.log("📌 Paso 4: Insertando datos de prueba...");
    const seedPath = path.join(__dirname, "db", "mysql_seed.sql");
    const seedCount = await executeSQLFile(appConnection, seedPath);
    console.log(
      `✓ Datos de prueba insertados (${seedCount} inserts ejecutados)\n`,
    );

    // Paso 5: Ejecutar migraciones adicionales
    console.log("📌 Paso 5: Ejecutando migraciones adicionales...");
    const migrationsPath = path.join(
      __dirname,
      "db",
      "add_supplies_and_production.sql",
    );

    if (fs.existsSync(migrationsPath)) {
      const migCount = await executeSQLFile(appConnection, migrationsPath);
      console.log(
        `✓ Migraciones completadas (${migCount} statements ejecutados)\n`,
      );
    } else {
      console.log("ℹ️  No hay migraciones adicionales\n");
    }

    // Paso 5.5: Ejecutar migraciones de corrección
    console.log("📌 Paso 5.5: Ejecutando migraciones de corrección...");
    const fixMigrationsPath = path.join(
      __dirname,
      "db",
      "fix_sales_orders_columns.sql",
    );

    if (fs.existsSync(fixMigrationsPath)) {
      const fixCount = await executeSQLFile(appConnection, fixMigrationsPath);
      console.log(
        `✓ Migraciones de corrección completadas (${fixCount} statements ejecutados)\n`,
      );
    } else {
      console.log("ℹ️  No hay migraciones de corrección\n");
    }

    // Paso 6: Verificar charset
    console.log("📌 Paso 6: Verificando configuración...");
    try {
      const [[dbInfo]] = await appConnection.execute(
        "SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
        [DB_NAME],
      );

      if (dbInfo) {
        console.log(`✓ Charset: ${dbInfo.DEFAULT_CHARACTER_SET_NAME}`);
        console.log(`✓ Collation: ${dbInfo.DEFAULT_COLLATION_NAME}\n`);
      }
    } catch (e) {
      console.log("ℹ️  No se pudo verificar charset\n");
    }

    // Paso 7: Contar registros
    console.log("📌 Paso 7: Resumen de datos:");
    const tables = [
      "users",
      "products",
      "supplies",
      "customers",
      "suppliers",
      "orders",
      "invoices",
    ];

    let totalRecords = 0;
    for (const table of tables) {
      try {
        const [[{ count }]] = await appConnection.execute(
          `SELECT COUNT(*) as count FROM ${table}`,
        );
        console.log(`  • ${table}: ${count} registros`);
        totalRecords += count;
      } catch (error) {
        // Tabla no existe, ignorar
      }
    }

    console.log(`\n📊 Total de registros: ${totalRecords}`);
    console.log("\n✅ ¡Base de datos configurada correctamente!");
    console.log("🎯 Puedes iniciar el servidor con: npm start\n");
  } catch (error) {
    console.error("\n❌ Error durante la configuración:");
    console.error(error.message);
    process.exit(1);
  } finally {
    if (rootConnection) rootConnection.release();
    if (appConnection) appConnection.release();
    if (appPool) await appPool.end();
  }
}

setupDatabase();
