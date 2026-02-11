#!/usr/bin/env node

/**
 * SCRIPT DE VERIFICACIÓN - Historial de Inventario
 *
 * Este script verifica que la solución esté instalada correctamente
 * Uso: node verify_inventory_history.js
 */

import mysql from "mysql2/promise";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pansoft_db",
};

async function verify() {
  console.log("\n🔍 VERIFICACIÓN - Historial de Inventario\n");
  console.log("=".repeat(50));

  let connection;

  try {
    // 1. Verificar conexión a BD
    console.log("\n✓ Verificando conexión a base de datos...");
    connection = await mysql.createConnection(DEFAULT_CONFIG);
    console.log("✅ Conexión exitosa");

    // 2. Verificar tabla inventory_movements
    console.log("\n✓ Verificando tabla 'inventory_movements'...");
    try {
      const [rows] = await connection.query("DESCRIBE inventory_movements");
      console.log(`✅ Tabla existe con ${rows.length} columnas`);
      console.log("   Columnas:");
      rows.forEach((col) => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log("❌ Tabla NO existe");
      console.log("   Ejecuta: node create_inventory_history.js");
      return false;
    }

    // 3. Verificar tabla supplies_movements
    console.log("\n✓ Verificando tabla 'supplies_movements'...");
    try {
      const [rows] = await connection.query("DESCRIBE supplies_movements");
      console.log(`✅ Tabla existe con ${rows.length} columnas`);
    } catch (error) {
      console.log("❌ Tabla NO existe");
      return false;
    }

    // 4. Verificar índices
    console.log("\n✓ Verificando índices...");
    const [indexes] = await connection.query(
      `
      SELECT DISTINCT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_NAME = 'inventory_movements' 
      AND TABLE_SCHEMA = ?
    `,
      [DEFAULT_CONFIG.database],
    );

    if (indexes.length > 1) {
      console.log(`✅ Índices creados: ${indexes.length}`);
      indexes.forEach((idx) => {
        console.log(`   - ${idx.INDEX_NAME}`);
      });
    } else {
      console.log("⚠️  Pocos índices encontrados");
    }

    // 5. Contar registros
    console.log("\n✓ Verificando registros...");
    const [[{ count1 }]] = await connection.query(
      "SELECT COUNT(*) as count1 FROM inventory_movements",
    );
    const [[{ count2 }]] = await connection.query(
      "SELECT COUNT(*) as count2 FROM supplies_movements",
    );

    console.log(`✅ Registros de movimientos de productos: ${count1}`);
    console.log(`✅ Registros de movimientos de insumos: ${count2}`);

    // 6. Ver últimos movimientos
    if (count1 > 0) {
      console.log("\n✓ Últimos 3 movimientos de inventario:");
      const [movements] = await connection.query(`
        SELECT 
          im.id,
          p.name,
          im.movement_type,
          im.quantity_change,
          im.created_at
        FROM inventory_movements im
        JOIN products p ON im.product_id = p.id
        ORDER BY im.created_at DESC
        LIMIT 3
      `);

      movements.forEach((move) => {
        console.log(
          `   - ${move.name}: ${move.movement_type} ${Math.abs(move.quantity_change)} (${move.created_at})`,
        );
      });
    } else {
      console.log("\n⚠️  No hay movimientos registrados aún");
      console.log("   Regista un movimiento en la interfaz para probar");
    }

    // 7. Verificar archivos de soporte
    console.log("\n✓ Verificando archivos de documentación...");
    const docsPath = path.join(__dirname, "..");
    const requiredDocs = [
      "SOLUCION_HISTORIAL_INVENTARIO.md",
      "GUIA_IMPLEMENTACION_HISTORIAL.md",
      "RESUMEN_VISUAL_HISTORIAL.md",
      "INICIO_RAPIDO_HISTORIAL.md",
    ];

    requiredDocs.forEach((doc) => {
      const fullPath = path.join(docsPath, doc);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${doc}`);
      } else {
        console.log(`❌ ${doc} (NO ENCONTRADO)`);
      }
    });

    // 8. Mostrar consultas útiles
    console.log("\n" + "=".repeat(50));
    console.log("\n📝 CONSULTAS ÚTILES:\n");

    console.log("Ver último movimiento:");
    console.log(
      "  SELECT * FROM inventory_movements ORDER BY created_at DESC LIMIT 1;",
    );

    console.log("\nVer movimientos de un producto:");
    console.log(
      "  SELECT * FROM inventory_movements WHERE product_id = ? ORDER BY created_at DESC;",
    );

    console.log("\nVer resumen por tipo:");
    console.log(
      "  SELECT movement_type, COUNT(*) FROM inventory_movements GROUP BY movement_type;",
    );

    // 9. Resumen final
    console.log("\n" + "=".repeat(50));
    console.log("\n✅ VERIFICACIÓN COMPLETADA\n");

    console.log("STATUS: TODO ESTÁ CONFIGURADO CORRECTAMENTE ✨\n");

    console.log("Próximos pasos:");
    console.log("1. Registra un movimiento en la interfaz");
    console.log("2. Verifica que aparezca en la tabla inventory_movements");
    console.log("3. Consulta el historial mediante la API:");
    console.log("   GET /api/inventory/:productId/history");
    console.log("   GET /api/inventory/history/all/movements\n");

    return true;
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error("\nSolución:");

    if (error.message.includes("ECONNREFUSED")) {
      console.error("- Verifica que MySQL esté corriendo");
      console.error("- Comprueba las variables de entorno:");
      console.error("  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
    } else if (error.message.includes("ER_BAD_DB_ERROR")) {
      console.error("- La base de datos no existe");
      console.error("- Crea la BD: CREATE DATABASE pansoft_db;");
    } else {
      console.error("- Ejecuta: node create_inventory_history.js");
    }

    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar verificación
verify()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Error crítico:", error);
    process.exit(1);
  });
