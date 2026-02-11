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

  const statements = sql
    .split(";")
    .map((stmt) => {
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

      if (upperStmt.startsWith("USE")) {
        continue;
      }

      await connection.execute(statement);
      successCount++;
    } catch (error) {
      if (
        error.code === "ER_DUP_FIELDNAME" ||
        error.code === "ER_TABLE_EXISTS_ERROR" ||
        error.code === "ER_DUP_ENTRY"
      ) {
        // Ignorar silenciosamente
      } else if (error.code === "ER_NO_REFERENCED_TABLE") {
        // Puede ocurrir por orden de creación
      } else {
        console.error(`⚠️  Error:`, error.message.substring(0, 100));
      }
    }
  }

  return successCount;
}

async function setupDatabaseSafe() {
  let rootConnection;
  let appConnection;
  let appPool;

  try {
    console.log("🔧 Setup Seguro de Base de Datos (SIN BORRAR DATOS)\n");

    // Paso 1: Verificar si la BD existe
    console.log("📌 Paso 1: Verificando base de datos...");
    rootConnection = await rootPool.getConnection();

    const [databases] = await rootConnection.execute(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
      [DB_NAME],
    );

    if (databases.length === 0) {
      // Crear nueva base de datos
      console.log(`✓ Base de datos '${DB_NAME}' no existe. Creando...`);
      await rootConnection.execute(
        `CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      console.log(`✓ Base de datos creada\n`);
    } else {
      console.log(`✓ Base de datos '${DB_NAME}' ya existe\n`);
    }

    rootConnection.release();
    await rootPool.end();

    // Paso 2: Conectar a la BD
    console.log("📌 Paso 2: Conectando a base de datos...");
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

    appConnection = await appPool.getConnection();
    console.log(`✓ Conectado a ${DB_NAME}\n`);

    // Paso 3: Crear/actualizar esquema
    console.log("📌 Paso 3: Creando/actualizando tablas...");
    const initPath = path.join(__dirname, "db", "mysql_init.sql");
    const createCount = await executeSQLFile(appConnection, initPath);
    console.log(`✓ Esquema actualizado (${createCount} statements)\n`);

    // Paso 4: Insertar datos de prueba SOLO SI LA TABLA ESTÁ VACÍA
    console.log("📌 Paso 4: Verificando datos de prueba...");
    const [[{ count: userCount }]] = await appConnection.execute(
      "SELECT COUNT(*) as count FROM users",
    );

    if (userCount === 0) {
      console.log("  → Base de datos vacía. Insertando datos de prueba...");
      const seedPath = path.join(__dirname, "db", "mysql_seed.sql");
      const seedCount = await executeSQLFile(appConnection, seedPath);
      console.log(`✓ Datos de prueba insertados (${seedCount} inserts)\n`);
    } else {
      console.log(
        `  → Base de datos ya contiene ${userCount} usuarios. Saltando datos de prueba\n`,
      );
    }

    // Paso 5: Ejecutar migraciones
    console.log("📌 Paso 5: Ejecutando migraciones...");
    const migrationsPath = path.join(
      __dirname,
      "db",
      "add_supplies_and_production.sql",
    );

    if (fs.existsSync(migrationsPath)) {
      const migCount = await executeSQLFile(appConnection, migrationsPath);
      console.log(`✓ Migraciones completadas (${migCount} statements)\n`);
    } else {
      console.log("ℹ️  No hay migraciones adicionales\n");
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

    // Paso 7: Resumen de datos
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
        // Tabla no existe
      }
    }

    console.log(`\n📊 Total de registros: ${totalRecords}`);
    console.log("\n✅ ¡Base de datos lista!");
    console.log("🎯 Puedes iniciar el servidor con: npm start\n");
  } catch (error) {
    console.error("\n❌ Error:");
    console.error(error.message);
    process.exit(1);
  } finally {
    if (rootConnection) rootConnection.release();
    if (appConnection) appConnection.release();
    if (appPool) await appPool.end();
  }
}

setupDatabaseSafe();
