import express from "express";
import {
  checkCriticalStock,
  checkLowStockProducts,
  createNotification,
  notificationService,
} from "./notificationService.js";

export default function inventoryRoutes(pool) {
  const router = express.Router();

  // ⚠️ IMPORTANTE: Las rutas específicas DEBEN venir antes de las genéricas

  // Get all inventory
  router.get("/", async (req, res) => {
    try {
      const [result] = await pool.query(`
        SELECT i.id, p.name, p.sku, i.quantity, p.price, p.category
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        ORDER BY p.name
      `);
      res.json(result);
    } catch (error) {
      console.error("Error al obtener inventario:", error);
      res.status(500).json({ error: "Error al obtener inventario" });
    }
  });

  // Get all inventory movements (ESPECÍFICO - antes de genéricas)
  router.get("/history/all/movements", async (req, res) => {
    try {
      const limit = req.query.limit || 100;
      const offset = req.query.offset || 0;

      console.log(
        `[GET /history/all/movements] Limit: ${limit}, Offset: ${offset}`,
      );

      let result = [];
      let countResult = [{ total: 0 }];

      // Verificar si la tabla existe primero
      let tableExists = true;
      try {
        await pool.query("DESCRIBE inventory_movements");
      } catch (checkError) {
        if (checkError.code === "ER_NO_SUCH_TABLE") {
          tableExists = false;
          console.warn(
            "[GET /history/all/movements] Tabla inventory_movements NO existe aún",
          );
        } else {
          throw checkError;
        }
      }

      if (tableExists) {
        // Si existe, obtener los datos
        try {
          const [records] = await pool.query(
            `
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
            LIMIT ? OFFSET ?
          `,
            [parseInt(limit), parseInt(offset)],
          );

          result = records || [];
          console.log(
            `[GET /history/all/movements] Encontrados ${result.length} registros`,
          );

          // Obtener total
          try {
            const [results] = await pool.query(
              "SELECT COUNT(*) as total FROM inventory_movements",
            );
            countResult = results.length > 0 ? results : [{ total: 0 }];
          } catch (countError) {
            console.error(
              "[GET /history/all/movements] Error al contar:",
              countError.message,
            );
            countResult = [{ total: result.length }];
          }
        } catch (queryError) {
          console.error(
            "[GET /history/all/movements] Error en query:",
            queryError.message,
          );
          result = [];
        }
      } else {
        console.log(
          "[GET /history/all/movements] Tabla no existe, retornando vacío",
        );
        result = [];
      }

      res.json({
        data: result,
        total: countResult[0]?.total || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      console.error(
        "[GET /history/all/movements] Error general:",
        error.message,
      );
      res.status(500).json({
        error: "Error al obtener movimientos",
        details: error.message,
        data: [],
        total: 0,
      });
    }
  });

  // Get inventory history for a specific product (ESPECÍFICO)
  router.get("/history/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const limit = req.query.limit || 50;

      const [result] = await pool.query(
        `
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
        WHERE im.product_id = ?
        ORDER BY im.created_at DESC
        LIMIT ?
      `,
        [productId, parseInt(limit)],
      );

      res.json(result);
    } catch (error) {
      console.error("Error al obtener historial de inventario:", error);
      res.status(500).json({ error: "Error al obtener historial" });
    }
  });

  // Get inventory by product (GENÉRICO)
  router.get("/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const [result] = await pool.query(
        "SELECT * FROM inventory WHERE product_id = ?",
        [productId],
      );
      res.json(result[0] || {});
    } catch (error) {
      console.error("Error al obtener inventario:", error);
      res.status(500).json({ error: "Error al obtener inventario" });
    }
  });

  // Update inventory with history tracking
  router.put("/:productId", async (req, res) => {
    let connection;
    try {
      const { productId } = req.params;
      const {
        quantity,
        movementType = "ajuste",
        reason = "",
        notes = "",
        userId,
      } = req.body;

      console.log(`[PUT /inventory/${productId}] Iniciando actualización...`, {
        quantity,
        movementType,
      });

      // Validar que quantity sea un número
      if (quantity === undefined || quantity === null) {
        return res.status(400).json({ error: "quantity es requerido" });
      }

      const quantityNum = parseInt(quantity);
      if (isNaN(quantityNum)) {
        return res.status(400).json({ error: "quantity debe ser un número" });
      }

      // Obtener conexión para transacción
      connection = await pool.getConnection();

      // PRIMERO: Verificar que el producto existe
      const [products] = await connection.query(
        "SELECT id FROM products WHERE id = ?",
        [productId],
      );

      const productExists = products.length > 0 ? products[0] : null;
      if (!productExists) {
        await connection.release();
        console.error(`[PUT /inventory/${productId}] Producto no existe`);
        return res.status(404).json({ error: "Producto no existe" });
      }

      console.log(
        `[PUT /inventory/${productId}] Producto existe, buscando en inventory...`,
      );

      // SEGUNDO: Obtener inventario actual o crear uno
      const [inventories] = await connection.query(
        "SELECT * FROM inventory WHERE product_id = ?",
        [productId],
      );

      const currentInventory = inventories.length > 0 ? inventories[0] : null;
      let previousQuantity = 0;

      if (!currentInventory) {
        // Si no existe registro de inventory, lo creamos
        console.log(
          `[PUT /inventory/${productId}] No existe inventario, creando uno...`,
        );

        await connection.query(
          "INSERT INTO inventory (product_id, quantity, warehouse_location) VALUES (?, ?, ?)",
          [productId, 0, "Almacén Principal"],
        );
        previousQuantity = 0;
      } else {
        previousQuantity = currentInventory.quantity;
      }

      const quantityChange = quantityNum - previousQuantity;

      // Start transaction
      await connection.query("START TRANSACTION");

      try {
        // Update inventory
        console.log(
          `[PUT /inventory/${productId}] Actualizando cantidad: ${previousQuantity} -> ${quantityNum}`,
        );
        await connection.query(
          "UPDATE inventory SET quantity = ?, last_updated = NOW() WHERE product_id = ?",
          [quantityNum, productId],
        );

        // ✨ IMPORTANTE: También actualizar stock en tabla products
        try {
          await connection.query(
            "UPDATE products SET stock_quantity = ?, updated_at = NOW() WHERE id = ?",
            [quantityNum, productId],
          );
          console.log(
            `[PUT /inventory/${productId}] ✅ Actualizado products.stock_quantity = ${quantityNum}`,
          );
        } catch (productsError) {
          console.warn(
            `[PUT /inventory/${productId}] ⚠️ Error actualizando products:`,
            productsError.message,
          );
        }

        // Intentar registrar movimiento en historial
        try {
          console.log(
            `[PUT /inventory/${productId}] Registrando movimiento en historial...`,
          );
          await connection.query(
            `
            INSERT INTO inventory_movements 
            (product_id, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
            [
              productId,
              movementType,
              quantityChange,
              previousQuantity,
              quantityNum,
              reason,
              notes,
              userId || null,
            ],
          );
        } catch (historyError) {
          if (historyError.code === "ER_NO_SUCH_TABLE") {
            console.warn(
              `[PUT /inventory/${productId}] Tabla inventory_movements no existe (aún)`,
            );
          } else {
            throw historyError;
          }
        }

        // Commit transaction
        await connection.query("COMMIT");

        console.log(`[PUT /inventory/${productId}] ✅ Actualización exitosa`);

        res.json({
          success: true,
          data: {
            product_id: productId,
            previous_quantity: previousQuantity,
            new_quantity: quantityNum,
            quantity_change: quantityChange,
            movement_type: movementType,
            reason: reason,
          },
        });
      } catch (txError) {
        await connection.query("ROLLBACK");
        throw txError;
      }
    } catch (error) {
      console.error(`[PUT /inventory] Error:`, error.message);
      res.status(500).json({
        error: "Error al actualizar inventario",
        details: error.message,
      });
    } finally {
      if (connection) {
        try {
          await connection.release();
        } catch (e) {
          console.error("Error liberando conexión:", e);
        }
      }
    }
  });

  // Delete all movement history
  router.delete("/history/clear/all", async (req, res) => {
    try {
      console.log(
        "[DELETE /history/clear/all] Limpiando historial de movimientos...",
      );

      // Verificar si la tabla existe
      try {
        await pool.query("DESCRIBE inventory_movements");
      } catch (checkError) {
        if (checkError.code === "ER_NO_SUCH_TABLE") {
          console.log(
            "[DELETE /history/clear/all] Tabla no existe, nada que limpiar",
          );
          return res.json({
            success: true,
            message: "Tabla de historial no existe",
            deletedCount: 0,
          });
        }
        throw checkError;
      }

      // Obtener cantidad de registros antes de borrar
      const [counts] = await pool.query(
        "SELECT COUNT(*) as total FROM inventory_movements",
      );

      const countBefore = counts.length > 0 ? counts[0].total : 0;

      // Borrar todos los movimientos
      const [deleteResult] = await pool.query(
        "DELETE FROM inventory_movements",
      );

      console.log(
        `[DELETE /history/clear/all] ✅ ${deleteResult.affectedRows} movimientos eliminados`,
      );

      res.json({
        success: true,
        message: "Historial limpiado correctamente",
        deletedCount: deleteResult.affectedRows,
      });
    } catch (error) {
      console.error("[DELETE /history/clear/all] Error:", error.message);
      res.status(500).json({
        error: "Error al limpiar historial",
        details: error.message,
      });
    }
  });

  // Verificar stock crítico
  router.post("/check/critical-stock", async (req, res) => {
    try {
      await checkCriticalStock(pool);
      res.json({
        success: true,
        message: "Verificación de stock crítico completada",
      });
    } catch (error) {
      console.error("Error verificando stock crítico:", error);
      res.status(500).json({ error: "Error al verificar stock crítico" });
    }
  });

  // Verificar productos con stock bajo
  router.post("/check/low-stock", async (req, res) => {
    try {
      await checkLowStockProducts(pool);
      res.json({
        success: true,
        message: "Verificación de productos con stock bajo completada",
      });
    } catch (error) {
      console.error("Error verificando bajo stock:", error);
      res.status(500).json({ error: "Error al verificar bajo stock" });
    }
  });

  // Procesar venta completa (factura + actualizar inventario)
  router.post("/process-sale", async (req, res) => {
    let connection;
    try {
      const { cart, invoiceNumber, invoiceDate } = req.body;

      console.log("[POST /process-sale] Iniciando procesamiento de venta...", {
        invoiceNumber,
        items: cart.length,
      });

      if (!cart || cart.length === 0) {
        return res.status(400).json({ error: "Carrito vacío" });
      }

      // Obtener conexión para transacción
      connection = await pool.getConnection();

      // Iniciar transacción
      await connection.query("START TRANSACTION");

      try {
        // Para cada producto en el carrito, actualizar inventario
        const updatedProducts = [];

        for (const item of cart) {
          console.log(
            `[POST /process-sale] Procesando producto ${item.id}: ${item.name} x${item.quantity}`,
          );

          // Obtener inventario actual
          const [inventories] = await connection.query(
            "SELECT quantity FROM inventory WHERE product_id = ?",
            [item.id],
          );

          const currentQuantity =
            inventories.length > 0 ? inventories[0].quantity : 0;
          const newQuantity = Math.max(0, currentQuantity - item.quantity);

          // Actualizar inventario
          await connection.query(
            "UPDATE inventory SET quantity = ?, last_updated = NOW() WHERE product_id = ?",
            [newQuantity, item.id],
          );

          // Actualizar también en tabla products
          try {
            await connection.query(
              "UPDATE products SET stock_quantity = ?, updated_at = NOW() WHERE id = ?",
              [newQuantity, item.id],
            );
          } catch (e) {
            console.warn(
              `Error actualizando products para ${item.id}:`,
              e.message,
            );
          }

          // Registrar movimiento
          try {
            await connection.query(
              `
              INSERT INTO inventory_movements 
              (product_id, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
              [
                item.id,
                "venta",
                -item.quantity,
                currentQuantity,
                newQuantity,
                `Venta factura ${invoiceNumber}`,
                `${item.name} - punto de venta`,
              ],
            );
          } catch (historyError) {
            if (historyError.code !== "ER_NO_SUCH_TABLE") {
              console.warn(
                "Error registrando movimiento:",
                historyError.message,
              );
            }
          }

          updatedProducts.push({
            product_id: item.id,
            name: item.name,
            previous_quantity: currentQuantity,
            sold_quantity: item.quantity,
            new_quantity: newQuantity,
          });
        }

        // Commit transacción
        await connection.query("COMMIT");

        console.log(
          `[POST /process-sale] ✅ Venta procesada exitosamente: ${invoiceNumber}`,
        );

        res.json({
          success: true,
          message: "Venta procesada exitosamente",
          invoiceNumber,
          invoiceDate,
          updatedProducts,
        });
      } catch (txError) {
        await connection.query("ROLLBACK");
        throw txError;
      }
    } catch (error) {
      console.error("[POST /process-sale] Error:", error.message);
      res.status(500).json({
        error: "Error al procesar la venta",
        details: error.message,
      });
    } finally {
      if (connection) {
        try {
          await connection.release();
        } catch (e) {
          console.error("Error liberando conexión:", e);
        }
      }
    }
  });

  return router;
}
