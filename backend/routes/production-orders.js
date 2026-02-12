import express from "express";

export default function productionOrdersRoutes(pool) {
  const router = express.Router();

  // Get all production orders
  router.get("/", async (req, res) => {
    try {
      console.log(
        "📥 GET /production-orders - Obteniendo todas las órdenes de producción",
      );

      const [orders] = await pool.query(`
        SELECT 
          po.id,
          po.order_number,
          po.product_id,
          po.quantity,
          po.responsible_employee_id,
          po.order_date,
          po.due_date,
          po.status,
          po.notes,
          p.name as product_name,
          CONCAT(e.first_name, ' ', e.last_name) as responsible_name
        FROM production_orders po
        LEFT JOIN products p ON po.product_id = p.id
        LEFT JOIN employees e ON po.responsible_employee_id = e.id
        ORDER BY po.order_date DESC
      `);

      console.log(`✓ Se obtuvieron ${orders.length} órdenes de producción`);
      res.json(orders);
    } catch (error) {
      console.error("❌ Error al obtener órdenes de producción:", {
        message: error.message,
        code: error.code,
        errno: error.errno,
        table: "production_orders",
      });
      res.status(500).json({
        error: "Error al obtener órdenes de producción",
        details: error.message,
        code: error.code,
      });
    }
  });

  // Get production order by ID with insumos
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const [order] = await pool.query(
        `
        SELECT 
          po.id,
          po.order_number,
          po.product_id,
          po.quantity,
          po.responsible_employee_id,
          po.order_date,
          po.due_date,
          po.status,
          po.notes,
          p.name as product_name,
          CONCAT(e.first_name, ' ', e.last_name) as responsible_name
        FROM production_orders po
        LEFT JOIN products p ON po.product_id = p.id
        LEFT JOIN employees e ON po.responsible_employee_id = e.id
        WHERE po.id = ?
      `,
        [id],
      );

      const [insumos] = await pool.query(
        `
        SELECT 
          poi.id,
          poi.production_order_id,
          poi.insumo_id,
          poi.quantity_required,
          poi.quantity_used,
          poi.unit,
          ins.name as insumo_name,
          ins.stock_quantity
        FROM production_order_insumos poi
        LEFT JOIN insumos ins ON poi.insumo_id = ins.id
        WHERE poi.production_order_id = ?
      `,
        [id],
      );

      res.json({ order: order[0], insumos });
    } catch (error) {
      console.error("Error al obtener orden de producción:", error);
      res.status(500).json({ error: "Error al obtener orden de producción" });
    }
  });

  // Create production order with insumos
  router.post("/", async (req, res) => {
    console.log("📥 POST /production-orders - Full request body:", req.body);
    console.log("📥 Request method:", req.method);
    console.log("📥 Request headers:", req.headers);
    
    const connection = await pool.getConnection();
    try {
      const {
        product_id,
        product_name,
        quantity,
        responsible_employee_id,
        due_date,
        notes,
        insumos,
      } = req.body;

      console.log("📥 Destructured values:", {
        product_id,
        product_name,
        quantity,
        responsible_employee_id,
        due_date,
        notes,
        insumos,
      });

      // Validación - aceptar product_id O product_name
      if (!quantity || !responsible_employee_id) {
        console.log("❌ Validation failed:", { 
          quantity: `${quantity} (${typeof quantity})`, 
          responsible_employee_id: `${responsible_employee_id} (${typeof responsible_employee_id})` 
        });
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      let actualProductId = product_id;

      // Si se proporciona product_name, buscar el ID en la tabla products
      if (product_name && !product_id) {
        const [products] = await connection.query(
          `SELECT id FROM products WHERE name = ? LIMIT 1`,
          [product_name],
        );
        
        if (!products || products.length === 0) {
          await connection.rollback();
          return res.status(400).json({ error: `Producto "${product_name}" no encontrado` });
        }
        
        actualProductId = products[0].id;
        console.log(`✓ Producto "${product_name}" encontrado con ID: ${actualProductId}`);
      }

      if (!actualProductId) {
        return res.status(400).json({ error: "Product ID o nombre del producto es requerido" });
      }

      // Generar número de orden PROD-XXX
      const [results] = await pool.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number, 6) AS UNSIGNED)), 0) as maxNum
        FROM production_orders
        WHERE order_number LIKE 'PROD-%'
      `);
      const maxNum = results[0]?.maxNum || 0;
      const orderNumber = `PROD-${String(maxNum + 1).padStart(3, "0")}`;

      // Iniciar transacción
      await connection.beginTransaction();

      // Insertar orden
      const [result] = await connection.query(
        `INSERT INTO production_orders (order_number, product_id, quantity, responsible_employee_id, due_date, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
        [
          orderNumber,
          actualProductId,
          quantity,
          responsible_employee_id,
          due_date,
          notes || null,
        ],
      );

      const orderId = result.insertId;

      // Insertar insumos si se proporcionan
      if (insumos && Array.isArray(insumos) && insumos.length > 0) {
        for (const insumo of insumos) {
          const { insumo_id, quantity_required, unit } = insumo;

          await connection.query(
            `INSERT INTO production_order_insumos (production_order_id, insumo_id, quantity_required, unit)
             VALUES (?, ?, ?, ?)`,
            [orderId, insumo_id, quantity_required, unit],
          );
        }
      }

      await connection.commit();

      res.status(201).json({
        message: "Orden de producción creada exitosamente",
        id: orderId,
        order_number: orderNumber,
        product_id,
        quantity,
        responsible_employee_id,
        due_date,
        notes,
        status: "pendiente",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error al crear orden de producción:", error);
      res
        .status(500)
        .json({ error: error.message || "Error al crear orden de producción" });
    } finally {
      await connection.release();
    }
  });

  // Update production order
  router.put("/:id", async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { id } = req.params;
      const { product_id, product_name, quantity, responsible_employee_id, due_date, notes } =
        req.body;

      let actualProductId = product_id;

      // Si se proporciona product_name, buscar el ID en la tabla products
      if (product_name && !product_id) {
        const [products] = await connection.query(
          `SELECT id FROM products WHERE name = ? LIMIT 1`,
          [product_name],
        );
        
        if (!products || products.length === 0) {
          await connection.release();
          return res.status(400).json({ error: `Producto "${product_name}" no encontrado` });
        }
        
        actualProductId = products[0].id;
        console.log(`✓ Producto "${product_name}" encontrado con ID: ${actualProductId}`);
      }

      const [result] = await connection.query(
        `UPDATE production_orders 
         SET product_id = ?, quantity = ?, responsible_employee_id = ?, due_date = ?, notes = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          actualProductId || product_id,
          quantity,
          responsible_employee_id,
          due_date,
          notes || null,
          id,
        ],
      );

      await connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Orden no encontrada" });
      }

      res.json({ message: "Orden actualizada exitosamente" });
    } catch (error) {
      await connection.release();
      console.error("Error al actualizar orden:", error);
      res.status(500).json({ error: "Error al actualizar orden" });
    }
  });

  // Update production order status
  router.patch("/:id/status", async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = [
        "pendiente",
        "en_proceso",
        "completada",
        "cancelada",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      // Obtener la orden actual para saber el producto y cantidad
      const [orders] = await connection.query(
        `SELECT id, product_id, quantity, status as current_status FROM production_orders WHERE id = ?`,
        [id],
      );

      if (!orders || orders.length === 0) {
        await connection.release();
        return res.status(404).json({ error: "Orden no encontrada" });
      }

      const order = orders[0];

      // Iniciar transacción
      await connection.beginTransaction();

      try {
        // Actualizar el estado de la orden
        const [result] = await connection.query(
          `UPDATE production_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
          [status, id],
        );

        // Si el estado nuevo es "completada" y no lo era antes, actualizar inventario
        if (status === "completada" && order.current_status !== "completada") {
          console.log(
            `✅ Orden ${id} marcada como completada. Actualizando inventario del producto ${order.product_id} (+${order.quantity} unidades)`,
          );

          // Obtener inventario actual
          const [inventories] = await connection.query(
            `SELECT * FROM inventory WHERE product_id = ?`,
            [order.product_id],
          );

          const currentInventory = inventories.length > 0 ? inventories[0] : null;
          const previousQuantity = currentInventory ? currentInventory.quantity : 0;
          const newQuantity = previousQuantity + order.quantity;

          // Actualizar o crear inventario
          if (!currentInventory) {
            await connection.query(
              `INSERT INTO inventory (product_id, quantity, warehouse_location) VALUES (?, ?, ?)`,
              [order.product_id, newQuantity, "Almacén Principal"],
            );
            console.log(
              `✅ Inventario creado para producto ${order.product_id} con cantidad ${newQuantity}`,
            );
          } else {
            await connection.query(
              `UPDATE inventory SET quantity = ?, last_updated = NOW() WHERE product_id = ?`,
              [newQuantity, order.product_id],
            );
            console.log(
              `✅ Inventario actualizado para producto ${order.product_id}: ${previousQuantity} -> ${newQuantity}`,
            );
          }

          // Actualizar también la tabla products
          try {
            await connection.query(
              `UPDATE products SET stock_quantity = ?, updated_at = NOW() WHERE id = ?`,
              [newQuantity, order.product_id],
            );
            console.log(
              `✅ stock_quantity en products actualizado a ${newQuantity}`,
            );
          } catch (productsError) {
            console.warn(
              `⚠️ Error actualizando products.stock_quantity:`,
              productsError.message,
            );
          }

          // Registrar el movimiento en historial
          try {
            await connection.query(
              `
              INSERT INTO inventory_movements 
              (product_id, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
              [
                order.product_id,
                "entrada",
                order.quantity,
                previousQuantity,
                newQuantity,
                `Orden de producción #${id} completada`,
                `Orden de producción finalizada - Entrada de inventario por producción completada`,
              ],
            );
            console.log(
              `✅ Movimiento de inventario registrado en historial`,
            );
          } catch (historyError) {
            if (historyError.code === "ER_NO_SUCH_TABLE") {
              console.warn(`⚠️ Tabla inventory_movements no existe`);
            } else {
              throw historyError;
            }
          }
        }

        await connection.commit();
      } catch (txError) {
        await connection.rollback();
        throw txError;
      }

      res.json({
        message: "Estado actualizado exitosamente",
        inventoryUpdated: status === "completada" && order.current_status !== "completada",
      });
    } catch (error) {
      try {
        await connection.rollback();
      } catch (e) {
        console.error("Error en rollback:", e);
      }
      console.error("Error al actualizar estado:", error);
      res.status(500).json({ error: "Error al actualizar estado", details: error.message });
    } finally {
      try {
        await connection.release();
      } catch (e) {
        console.error("Error liberando conexión:", e);
      }
    }
  });

  // Delete production order
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.query(
        `DELETE FROM production_orders WHERE id = ?`,
        [id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Orden no encontrada" });
      }

      res.json({ message: "Orden eliminada exitosamente" });
    } catch (error) {
      console.error("Error al eliminar orden:", error);
      res.status(500).json({ error: "Error al eliminar orden" });
    }
  });

  // Update a specific production order insumo
  router.patch("/:id/insumos/:insumoId", async (req, res) => {
    try {
      const { id, insumoId } = req.params;
      const { quantity_required, unit } = req.body;

      if (!quantity_required || quantity_required <= 0) {
        return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
      }

      // Verificar que el insumo pertenece a la orden
      const [insumos] = await pool.query(
        `SELECT * FROM production_order_insumos WHERE id = ? AND production_order_id = ?`,
        [insumoId, id]
      );

      if (!insumos || insumos.length === 0) {
        return res.status(404).json({ error: "Insumo no encontrado en esta orden" });
      }

      await pool.query(
        `UPDATE production_order_insumos 
         SET quantity_required = ?, unit = ?, updated_at = NOW()
         WHERE id = ? AND production_order_id = ?`,
        [quantity_required, unit || insumos[0].unit, insumoId, id]
      );

      res.json({
        message: "Insumo actualizado exitosamente",
        insumoId,
        quantity_required,
        unit: unit || insumos[0].unit
      });
    } catch (error) {
      console.error("Error al actualizar insumo:", error);
      res.status(500).json({ error: "Error al actualizar insumo", details: error.message });
    }
  });

  // Delete a specific production order insumo
  router.delete("/:id/insumos/:insumoId", async (req, res) => {
    try {
      const { id, insumoId } = req.params;

      // Verificar que el insumo pertenece a la orden
      const [insumos] = await pool.query(
        `SELECT * FROM production_order_insumos WHERE id = ? AND production_order_id = ?`,
        [insumoId, id]
      );

      if (!insumos || insumos.length === 0) {
        return res.status(404).json({ error: "Insumo no encontrado en esta orden" });
      }

      await pool.query(
        `DELETE FROM production_order_insumos WHERE id = ? AND production_order_id = ?`,
        [insumoId, id]
      );

      res.json({
        message: "Insumo eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error al eliminar insumo:", error);
      res.status(500).json({ error: "Error al eliminar insumo", details: error.message });
    }
  });

  return router;
}
