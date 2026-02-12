import express from "express";
import upload from "../multerConfig.js";
import { checkLowStockSupplies, createNotification, notificationService } from "./notificationService.js";

export default function suppliesRoutes(pool) {
  const router = express.Router();

  // Get all supplies
  router.get("/", async (req, res) => {
    try {
      const [result] = await pool.query(
        "SELECT * FROM supplies ORDER BY name ASC",
      );
      res.json(result);
    } catch (error) {
      console.error("Error detallado al obtener insumos:", error);
      res
        .status(500)
        .json({ error: "Error al obtener insumos", details: error.message });
    }
  });

  // ⚠️ RUTAS ESPECÍFICAS ANTES DE LAS GENÉRICAS

  // Get all supply movements (ESPECÍFICO - antes de /:id)
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
        await pool.query("DESCRIBE supplies_movements");
      } catch (checkError) {
        if (checkError.code === "ER_NO_SUCH_TABLE") {
          tableExists = false;
          console.warn(
            "[GET /history/all/movements] Tabla supplies_movements NO existe aún",
          );
        } else {
          throw checkError;
        }
      }

      if (tableExists) {
        try {
          const [records] = await pool.query(
            `
            SELECT 
              sm.id,
              sm.supply_id,
              s.name as supply_name,
              s.sku,
              sm.movement_type,
              sm.quantity_change,
              sm.previous_quantity,
              sm.new_quantity,
              sm.reason,
              sm.notes,
              u.full_name as user_name,
              sm.created_at
            FROM supplies_movements sm
            JOIN supplies s ON sm.supply_id = s.id
            LEFT JOIN users u ON sm.user_id = u.id
            ORDER BY sm.created_at DESC
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
              "SELECT COUNT(*) as total FROM supplies_movements",
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

  // Get supply history for a specific supply (ESPECÍFICO)
  router.get("/history/:supplyId", async (req, res) => {
    try {
      const { supplyId } = req.params;
      const limit = req.query.limit || 50;

      const [result] = await pool.query(
        `
        SELECT 
          sm.id,
          sm.supply_id,
          s.name as supply_name,
          s.sku,
          sm.movement_type,
          sm.quantity_change,
          sm.previous_quantity,
          sm.new_quantity,
          sm.reason,
          sm.notes,
          u.full_name as user_name,
          sm.created_at
        FROM supplies_movements sm
        JOIN supplies s ON sm.supply_id = s.id
        LEFT JOIN users u ON sm.user_id = u.id
        WHERE sm.supply_id = ?
        ORDER BY sm.created_at DESC
        LIMIT ?
      `,
        [supplyId, parseInt(limit)],
      );

      res.json(result);
    } catch (error) {
      console.error("Error al obtener historial de suministro:", error);
      res.status(500).json({ error: "Error al obtener historial" });
    }
  });

  // Get supply by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query("SELECT * FROM supplies WHERE id = ?", [
        id,
      ]);
      res.json(result[0] || {});
    } catch (error) {
      console.error("Error al obtener insumo:", error);
      res.status(500).json({ error: "Error al obtener insumo" });
    }
  });

  // Create supply with image
  router.post("/", upload.single("image"), async (req, res) => {
    try {
      const {
        name,
        sku,
        description,
        category,
        price,
        stock_quantity,
        min_stock_level,
        unit,
      } = req.body;
      const imageUrl = req.file ? `/images/${req.file.filename}` : null;

      const [result] = await pool.query(
        "INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          sku,
          description,
          category,
          price,
          stock_quantity,
          min_stock_level,
          unit,
          imageUrl,
        ],
      );
      res.status(201).json({
        id: result.insertId,
        name,
        sku,
        description,
        category,
        price,
        stock_quantity,
        min_stock_level,
        unit,
        supplier_id,
        image_url: imageUrl,
      });
    } catch (error) {
      console.error("Error al crear insumo:", error);
      if (error.code === "ER_DUP_ENTRY") {
        res.status(409).json({
          error: `El nombre "${error.sqlMessage.match(/'([^']*)'/)?.[1] || "proporcionado"}" ya existe. Por favor usa un nombre único.`,
        });
      } else {
        res
          .status(500)
          .json({ error: "Error al crear insumo: " + error.message });
      }
    }
  });

  // Update supply with movement history tracking
  router.put("/:id", upload.single("image"), async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const {
        name,
        sku,
        description,
        category,
        price,
        quantity,
        stock_quantity,
        min_stock_level,
        unit,
        movementType = "ajuste",
        reason = "",
        notes = "",
        userId,
      } = req.body;

      // Aceptar tanto 'quantity' (compatible con inventario) como 'stock_quantity'
      const finalQuantity = quantity !== undefined ? quantity : stock_quantity;

      console.log(`[PUT /supplies/${id}] Iniciando actualización...`, {
        finalQuantity,
        movementType,
      });

      // Obtener conexión para transacción
      connection = await pool.getConnection();

      // Verificar que el supply existe
      const [supplies] = await connection.query(
        "SELECT id, stock_quantity FROM supplies WHERE id = ?",
        [id],
      );

      const supplyExists = supplies.length > 0 ? supplies[0] : null;
      if (!supplyExists) {
        await connection.release();
        console.error(`[PUT /supplies/${id}] Supply no existe`);
        return res.status(404).json({ error: "Insumo no encontrado" });
      }

      const previousQuantity = supplyExists.stock_quantity || 0;
      const newQuantity =
        finalQuantity !== undefined ? finalQuantity : previousQuantity;
      const quantityChange = newQuantity - previousQuantity;

      // Start transaction
      await connection.query("START TRANSACTION");

      try {
        // Build base update query
        let query =
          "UPDATE supplies SET name=?, sku=?, category=?, price=?, stock_quantity=?, min_stock_level=?, unit=?, updated_at=NOW()";
        let params = [
          name,
          sku,
          category,
          price,
          newQuantity,
          min_stock_level,
          unit,
        ];

        // Agregar description solo si se proporciona
        if (description !== undefined && description !== null) {
          query =
            "UPDATE supplies SET name=?, sku=?, description=?, category=?, price=?, stock_quantity=?, min_stock_level=?, unit=?, updated_at=NOW()";
          params = [
            name,
            sku,
            description,
            category,
            price,
            newQuantity,
            min_stock_level,
            unit,
          ];
        }

        if (req.file) {
          query += ", image_url=?";
          params.push(`/images/${req.file.filename}`);
        }

        query += " WHERE id=?";
        params.push(id);

        console.log(
          `[PUT /supplies/${id}] Actualizando cantidad: ${previousQuantity} -> ${newQuantity}`,
        );
        await connection.query(query, params);

        // Registrar movimiento en historial si la cantidad cambió
        if (quantityChange !== 0) {
          try {
            console.log(
              `[PUT /supplies/${id}] Registrando movimiento en historial...`,
            );
            await connection.query(
              `
              INSERT INTO supplies_movements 
              (supply_id, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes, user_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
              [
                id,
                movementType,
                quantityChange,
                previousQuantity,
                newQuantity,
                reason || "",
                notes || "",
                userId || null,
              ],
            );
          } catch (historyError) {
            if (historyError.code === "ER_NO_SUCH_TABLE") {
              console.warn(
                `[PUT /supplies/${id}] Tabla supplies_movements no existe (aún)`,
              );
            } else {
              throw historyError;
            }
          }
        }

        // Commit transaction
        await connection.query("COMMIT");

        console.log(`[PUT /supplies/${id}] ✅ Actualización exitosa`);

        const [updatedSupplies] = await connection.query(
          "SELECT * FROM supplies WHERE id = ?",
          [id],
        );

        const updatedSupply = updatedSupplies.length > 0 ? updatedSupplies[0] : null;

        res.json({
          success: true,
          data: {
            ...updatedSupply,
            movement: {
              previous_quantity: previousQuantity,
              new_quantity: newQuantity,
              quantity_change: quantityChange,
              movement_type: movementType,
              reason: reason,
            },
          },
        });
      } catch (txError) {
        await connection.query("ROLLBACK");
        throw txError;
      }
    } catch (error) {
      console.error(`[PUT /supplies] Error:`, error.message);
      res.status(500).json({
        error: "Error al actualizar insumo",
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

  // Update supply stock with movement tracking
  router.patch("/:id/stock", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const {
        stock_quantity,
        movementType = "ajuste",
        reason = "",
        userId,
      } = req.body;

      if (stock_quantity === undefined) {
        return res.status(400).json({ error: "stock_quantity es requerido" });
      }

      console.log(`[PATCH /supplies/${id}/stock] Actualizando stock...`, {
        stock_quantity,
        movementType,
      });

      connection = await pool.getConnection();

      // Verificar que el supply existe
      const [supplies2] = await connection.query(
        "SELECT id, stock_quantity FROM supplies WHERE id = ?",
        [id],
      );

      const supply = supplies2.length > 0 ? supplies2[0] : null;
      if (!supply) {
        await connection.release();
        return res.status(404).json({ error: "Insumo no encontrado" });
      }

      const previousQuantity = supply.stock_quantity || 0;
      const newQuantity = parseInt(stock_quantity);
      const quantityChange = newQuantity - previousQuantity;

      if (isNaN(newQuantity)) {
        await connection.release();
        return res
          .status(400)
          .json({ error: "stock_quantity debe ser número" });
      }

      // Start transaction
      await connection.query("START TRANSACTION");

      try {
        // Update stock
        await connection.query(
          "UPDATE supplies SET stock_quantity = ?, updated_at = NOW() WHERE id = ?",
          [newQuantity, id],
        );

        // Register movement
        if (quantityChange !== 0) {
          try {
            await connection.query(
              `
              INSERT INTO supplies_movements 
              (supply_id, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes, user_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
              [
                id,
                movementType,
                quantityChange,
                previousQuantity,
                newQuantity,
                reason || "",
                "[PATCH stock endpoint]",
                userId || null,
              ],
            );
          } catch (historyError) {
            if (historyError.code !== "ER_NO_SUCH_TABLE") {
              throw historyError;
            }
          }
        }

        await connection.query("COMMIT");

        res.json({
          success: true,
          id,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          quantity_change: quantityChange,
        });
      } catch (txError) {
        await connection.query("ROLLBACK");
        throw txError;
      }
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      res.status(500).json({ error: "Error al actualizar stock" });
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

  // Disable supply (soft delete)
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        "UPDATE supplies SET is_active = FALSE, updated_at = NOW() WHERE id = ?",
        [id],
      );
      res.status(204).send();
    } catch (error) {
      console.error("Error al deshabilitar insumo:", error);
      res.status(500).json({ error: "Error al deshabilitar insumo" });
    }
  });

  // Toggle supply status
  router.patch("/:id/toggle-status", async (req, res) => {
    try {
      const { id } = req.params;

      // Obtener estado actual
      const [current] = await pool.query(
        "SELECT is_active FROM supplies WHERE id = ?",
        [id],
      );

      if (!current.length) {
        return res.status(404).json({ error: "Insumo no encontrado" });
      }

      const newStatus = !current[0].is_active;

      // Cambiar estado
      await pool.query(
        "UPDATE supplies SET is_active = ?, updated_at = NOW() WHERE id = ?",
        [newStatus, id],
      );

      res.json({ success: true, is_active: newStatus });
    } catch (error) {
      console.error("Error al cambiar estado del insumo:", error);
      res.status(500).json({
        error: "Error al cambiar estado del insumo",
        details: error.message,
      });
    }
  });

  // Get product recipes (supplies needed for a product)
  router.get("/recipes/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const [recipes] = await pool.query(
        `
        SELECT 
          pr.*,
          i.name as insumo_name,
          i.stock_quantity,
          i.unit as insumo_unit
        FROM product_recipes pr
        LEFT JOIN insumos i ON pr.insumo_id = i.id
        WHERE pr.product_id = ?
        ORDER BY i.name ASC
      `,
        [productId],
      );

      res.json(recipes);
    } catch (error) {
      console.error("Error al obtener receta:", error);
      res.status(500).json({ error: "Error al obtener receta" });
    }
  });

  // Create product recipe
  router.post("/recipes/create", async (req, res) => {
    try {
      const { product_id, insumo_id, quantity_per_unit, unit } = req.body;

      const [result] = await pool.query(
        `INSERT INTO product_recipes 
         (product_id, insumo_id, quantity_per_unit, unit) 
         VALUES (?, ?, ?, ?)`,
        [product_id, insumo_id, quantity_per_unit, unit],
      );

      res.status(201).json({
        id: result.insertId,
        product_id,
        insumo_id,
        quantity_per_unit,
        unit,
      });
    } catch (error) {
      console.error("Error al crear receta:", error);
      res.status(500).json({ error: "Error al crear receta" });
    }
  });

  // Delete all supply movement history
  router.delete("/history/clear/all", async (req, res) => {
    try {
      console.log(
        "[DELETE /history/clear/all] Limpiando historial de movimientos de supplies...",
      );

      // Verificar si la tabla existe
      try {
        await pool.query("DESCRIBE supplies_movements");
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
        "SELECT COUNT(*) as total FROM supplies_movements",
      );

      const countBefore = counts.length > 0 ? counts[0].total : 0;

      // Borrar todos los movimientos
      const [deleteResult] = await pool.query("DELETE FROM supplies_movements");

      console.log(
        `[DELETE /history/clear/all] ✅ ${deleteResult.affectedRows} movimientos eliminados`,
      );

      res.json({
        success: true,
        message: "Historial de supplies limpiado correctamente",
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

  // Verificar insumos con stock bajo
  router.post("/check/low-stock", async (req, res) => {
    try {
      await checkLowStockSupplies(pool);
      res.json({ success: true, message: "Verificación de insumos con stock bajo completada" });
    } catch (error) {
      console.error("Error verificando insumos con bajo stock:", error);
      res.status(500).json({ error: "Error al verificar insumos con bajo stock" });
    }
  });

  return router;
}
