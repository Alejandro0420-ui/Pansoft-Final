#!/usr/bin/env node
/**
 * Script de debugging para notificaciones de stock crítico
 * Verifica la estructura de datos y ejecuta diagnósticos
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pansoft_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

async function debugStockCritico() {
  console.log("🔍 DEBUGGING - Stock Crítico\n");
  console.log("═".repeat(60));

  try {
    // 1. Verificar estructura de tabla products
    console.log("\n1️⃣ Estructura de tabla 'products':");
    console.log("─".repeat(60));
    try {
      const [columns] = await pool.query("DESCRIBE products");
      console.log("✓ Campos disponibles:");
      columns.forEach((col) => {
        const nullable = col.Null === "YES" ? "NULL" : "NOT NULL";
        console.log(`  • ${col.Field} (${col.Type}) - ${nullable}`);
      });
    } catch (err) {
      console.log("❌ Error:", err.message);
    }

    // 2. Verificar estructura de tabla inventory
    console.log("\n2️⃣ Estructura de tabla 'inventory':");
    console.log("─".repeat(60));
    try {
      const [columns] = await pool.query("DESCRIBE inventory");
      console.log("✓ Campos disponibles:");
      columns.forEach((col) => {
        const nullable = col.Null === "YES" ? "NULL" : "NOT NULL";
        console.log(`  • ${col.Field} (${col.Type}) - ${nullable}`);
      });
    } catch (err) {
      console.log("❌ Error:", err.message);
    }

    // 3. Contar productos totales
    console.log("\n3️⃣ Cantidad de productos:");
    console.log("─".repeat(60));
    try {
      const [totalProducts] = await pool.query(
        "SELECT COUNT(*) as total FROM products",
      );
      console.log(`✓ Total de productos: ${totalProducts[0].total}`);

      const [activeProducts] = await pool.query(
        "SELECT COUNT(*) as total FROM products WHERE is_active = 1 OR is_active IS NULL",
      );
      console.log(`✓ Productos activos: ${activeProducts[0].total}`);
    } catch (err) {
      console.log("❌ Error:", err.message);
    }

    // 4. Verificar min_stock_level
    console.log("\n4️⃣ Valores de min_stock_level:");
    console.log("─".repeat(60));
    try {
      const [minStockInfo] = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN min_stock_level IS NULL THEN 1 END) as null_values,
          COUNT(CASE WHEN min_stock_level = 0 THEN 1 END) as zero_values,
          COUNT(CASE WHEN min_stock_level > 0 THEN 1 END) as valid_values,
          MIN(min_stock_level) as min_val,
          MAX(min_stock_level) as max_val,
          AVG(min_stock_level) as avg_val
        FROM products
      `);
      console.log(`✓ Total productos: ${minStockInfo[0].total}`);
      console.log(`✓ Con NULL: ${minStockInfo[0].null_values}`);
      console.log(`✓ Con 0: ${minStockInfo[0].zero_values}`);
      console.log(`✓ Con valor válido: ${minStockInfo[0].valid_values}`);
      console.log(`✓ Mínimo: ${minStockInfo[0].min_val}`);
      console.log(`✓ Máximo: ${minStockInfo[0].max_val}`);
      console.log(`✓ Promedio: ${minStockInfo[0].avg_val?.toFixed(2)}`);
    } catch (err) {
      console.log("❌ Error:", err.message);
    }

    // 5. Verificar inventario
    console.log("\n5️⃣ Datos en tabla inventory:");
    console.log("─".repeat(60));
    try {
      const [inventoryCount] = await pool.query(
        "SELECT COUNT(*) as total FROM inventory",
      );
      console.log(`✓ Total registros: ${inventoryCount[0].total}`);

      const [inventoryStats] = await pool.query(`
        SELECT 
          MIN(quantity) as min_qty,
          MAX(quantity) as max_qty,
          AVG(quantity) as avg_qty
        FROM inventory
      `);
      console.log(`✓ Cantidad mínima: ${inventoryStats[0].min_qty}`);
      console.log(`✓ Cantidad máxima: ${inventoryStats[0].max_qty}`);
      console.log(
        `✓ Cantidad promedio: ${inventoryStats[0].avg_qty?.toFixed(2)}`,
      );
    } catch (err) {
      console.log("❌ Error:", err.message);
    }

    // 6. Ejecutar query de stock crítico
    console.log("\n6️⃣ Query de STOCK CRÍTICO (< 30% del mínimo):");
    console.log("─".repeat(60));
    try {
      const [criticalProducts] = await pool.query(`
        SELECT p.id, p.name, p.sku, i.quantity, p.min_stock_level,
               ROUND((i.quantity / p.min_stock_level) * 100, 2) as stock_percentage
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE (p.is_active = 1 OR p.is_active IS NULL)
        AND p.min_stock_level > 0
        AND (i.quantity IS NULL OR i.quantity <= (p.min_stock_level * 0.3))
        ORDER BY stock_percentage ASC
      `);

      console.log(
        `✓ Productos con stock crítico encontrados: ${criticalProducts.length}`,
      );

      if (criticalProducts.length > 0) {
        console.log("\nDetalle:");
        criticalProducts.forEach((product, idx) => {
          console.log(`\n  ${idx + 1}. ${product.name}`);
          console.log(`     SKU: ${product.sku}`);
          console.log(`     Stock actual: ${product.quantity || 0} unidades`);
          console.log(`     Mínimo: ${product.min_stock_level} unidades`);
          console.log(`     Porcentaje: ${product.stock_percentage || "N/A"}%`);
        });
      } else {
        console.log("⚠️  No se encontraron productos con stock crítico");
      }
    } catch (err) {
      console.log("❌ Error en query:", err.message);
      console.log("\nPista: Verifica que:");
      console.log("  • El campo 'min_stock_level' existe en products");
      console.log("  • La tabla 'inventory' está vinculada correctamente");
      console.log("  • Hay productos con status = 'active'");
    }

    // 7. Ejecutar query de bajo stock
    console.log("\n7️⃣ Query de BAJO STOCK (30-100% del mínimo):");
    console.log("─".repeat(60));
    try {
      const [lowStockProducts] = await pool.query(`
        SELECT p.id, p.name, p.sku, i.quantity, p.min_stock_level,
               ROUND((i.quantity / p.min_stock_level) * 100, 2) as stock_percentage
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE (p.is_active = 1 OR p.is_active IS NULL)
        AND p.min_stock_level > 0
        AND (i.quantity IS NULL OR (i.quantity > (p.min_stock_level * 0.3) AND i.quantity <= p.min_stock_level))
        ORDER BY stock_percentage ASC
      `);

      console.log(
        `✓ Productos con stock bajo encontrados: ${lowStockProducts.length}`,
      );

      if (lowStockProducts.length > 0) {
        console.log("\nDetalle (mostrando primeros 5):");
        lowStockProducts.slice(0, 5).forEach((product, idx) => {
          console.log(`\n  ${idx + 1}. ${product.name}`);
          console.log(`     Stock actual: ${product.quantity || 0} unidades`);
          console.log(`     Mínimo: ${product.min_stock_level} unidades`);
          console.log(`     Porcentaje: ${product.stock_percentage || "N/A"}%`);
        });

        if (lowStockProducts.length > 5) {
          console.log(`\n  ... y ${lowStockProducts.length - 5} más`);
        }
      }
    } catch (err) {
      console.log("❌ Error:", err.message);
    }

    // 8. Verificar notificaciones existentes
    console.log("\n8️⃣ Notificaciones existentes:");
    console.log("─".repeat(60));
    try {
      const [notifications] = await pool.query(`
        SELECT type, COUNT(*) as count FROM notifications GROUP BY type
      `);

      if (notifications.length > 0) {
        console.log("✓ Notificaciones por tipo:");
        notifications.forEach((notif) => {
          console.log(`  • ${notif.type}: ${notif.count}`);
        });
      } else {
        console.log("⚠️  No hay notificaciones en la base de datos");
      }
    } catch (err) {
      console.log("❌ Error:", err.message);
    }

    // 9. Recomendaciones
    console.log("\n💡 RECOMENDACIONES:");
    console.log("─".repeat(60));
    console.log(`
1. Verifica que los productos tengan 'min_stock_level' configurado
   SELECT * FROM products LIMIT 5;

2. Si los valores NULL, actualiza:
   UPDATE products SET min_stock_level = 50 WHERE min_stock_level IS NULL;

3. Si los valores son 0, actualiza:
   UPDATE products SET min_stock_level = 100 WHERE min_stock_level = 0;

4. Verifica que hay datos en inventory:
   SELECT * FROM inventory LIMIT 5;

5. Si inventory está vacía, inserta datos:
   INSERT INTO inventory (product_id, quantity) VALUES (1, 100);

6. Verifica que los status sean 'active':
   SELECT DISTINCT status FROM products;

7. Si necesitas cambiar status:
   UPDATE products SET status = 'active' WHERE status IS NULL;
    `);
  } catch (error) {
    console.error("❌ Error general:", error);
  } finally {
    await pool.end();
    console.log("\n✅ Debugging completado");
  }
}

debugStockCritico();
