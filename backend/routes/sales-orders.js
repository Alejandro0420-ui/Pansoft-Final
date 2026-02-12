import express from "express";

export default function salesOrdersRoutes(pool) {
  const router = express.Router();

  // Get all sales orders
  router.get("/", async (req, res) => {
    try {
      console.log(
        "📥 GET /sales-orders - Obteniendo todas las órdenes de venta",
      );

      const [orders] = await pool.query(`
        SELECT 
          so.id,
          so.order_number,
          so.customer_id,
          so.customer_name,
          so.order_date,
          so.delivery_date,
          so.total_amount,
          so.status,
          so.notes,
          so.created_at,
          so.updated_at,
          COALESCE(COUNT(soi.id), 0) as item_count
        FROM sales_orders so
        LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
        GROUP BY so.id, so.order_number, so.customer_id, so.customer_name, so.order_date, so.delivery_date, so.total_amount, so.status, so.notes, so.created_at, so.updated_at
        ORDER BY so.order_date DESC
      `);

      console.log(`✓ Se obtuvieron ${orders.length} órdenes de venta`);
      res.json(orders);
    } catch (error) {
      console.error("❌ Error al obtener órdenes de venta:", {
        message: error.message,
        code: error.code,
        errno: error.errno,
        table: "sales_orders",
      });
      res.status(500).json({
        error: "Error al obtener órdenes de venta",
        details: error.message,
        code: error.code,
      });
    }
  });

  // Get sales order by ID with items and supplies
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const [orders] = await pool.query(
        `
        SELECT 
          id,
          order_number,
          customer_id,
          customer_name,
          order_date,
          delivery_date,
          total_amount,
          status,
          notes,
          created_at,
          updated_at
        FROM sales_orders
        WHERE id = ?
      `,
        [id],
      );

      if (!orders || orders.length === 0) {
        return res.status(404).json({ error: "Orden no encontrada" });
      }

      const order = orders[0];

      const [items] = await pool.query(
        `
        SELECT 
          soi.*, 
          p.name as product_name
        FROM sales_order_items soi
        LEFT JOIN products p ON soi.product_id = p.id
        WHERE soi.sales_order_id = ?
      `,
        [id],
      );

      const [supplies] = await pool.query(
        `
        SELECT 
          soi.*, 
          ins.name as insumo_name
        FROM sales_order_insumos soi
        LEFT JOIN insumos ins ON soi.insumo_id = ins.id
        WHERE soi.sales_order_id = ?
      `,
        [id],
      );

      res.json({ ...order, items, supplies });
    } catch (error) {
      console.error("Error al obtener orden de venta:", error);
      res.status(500).json({ error: "Error al obtener orden de venta" });
    }
  });

  // Create sales order
  router.post("/", async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        customer_id,
        customer_name,
        delivery_date,
        total_amount,
        items,
        supplies,
      } = req.body;

      // Validación: debe haber nombre de cliente
      if (!customer_name) {
        await connection.rollback();
        return res
          .status(400)
          .json({ error: "El nombre del cliente es requerido" });
      }

      // Generate order number
      try {
        const [rows] = await connection.query(
          `SELECT COALESCE(MAX(CASE 
              WHEN order_number LIKE 'VNT-%' THEN CAST(SUBSTRING(order_number, 5) AS UNSIGNED) 
              ELSE 0 
            END), 0) as maxNum
           FROM sales_orders`,
        );
        const maxNum = rows[0]?.maxNum || 0;
        const orderNumber = `VNT-${String(maxNum + 1).padStart(3, "0")}`;

        // Insert sales order
        const [result] = await connection.query(
          `INSERT INTO sales_orders 
           (order_number, customer_id, customer_name, delivery_date, total_amount, status) 
           VALUES (?, ?, ?, ?, ?, 'pending')`,
          [
            orderNumber,
            customer_id || null,
            customer_name,
            delivery_date || new Date().toISOString().split("T")[0],
            total_amount || 0,
          ],
        );

        const orderId = result.insertId;

        // Insert order items
        if (items && items.length > 0) {
          for (const item of items) {
            await connection.query(
              `INSERT INTO sales_order_items 
               (sales_order_id, product_id, quantity, unit_price, total) 
               VALUES (?, ?, ?, ?, ?)`,
              [
                orderId,
                item.product_id,
                item.quantity,
                item.unit_price,
                item.total,
              ],
            );
          }
        }

        // Insert custom insumos
        if (supplies && supplies.length > 0) {
          for (const supply of supplies) {
            await connection.query(
              `INSERT INTO sales_order_insumos 
               (sales_order_id, insumo_id, quantity_required, unit) 
               VALUES (?, ?, ?, ?)`,
              [
                orderId,
                supply.insumo_id,
                supply.quantity_required,
                supply.unit,
              ],
            );
          }
        }

        await connection.commit();

        res.status(201).json({
          id: orderId,
          order_number: orderNumber,
          customer_id: customer_id || null,
          customer_name: customer_name,
          delivery_date:
            delivery_date || new Date().toISOString().split("T")[0],
          total_amount: total_amount || 0,
          status: "pending",
        });
      } catch (innerError) {
        await connection.rollback();
        throw innerError;
      }
    } catch (error) {
      console.error("Error al crear orden de venta:", error);
      res
        .status(500)
        .json({ error: error.message || "Error al crear orden de venta" });
    } finally {
      await connection.release();
    }
  });

  // Update sales order
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        customer_id,
        customer_name,
        delivery_date,
        total_amount,
        status,
      } = req.body;

      await pool.query(
        `UPDATE sales_orders 
         SET customer_id = ?, customer_name = ?, delivery_date = ?, total_amount = ?, status = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          customer_id || null,
          customer_name,
          delivery_date,
          total_amount,
          status,
          id,
        ],
      );

      res.json({
        id,
        customer_id: customer_id || null,
        customer_name,
        delivery_date,
        total_amount,
        status,
      });
    } catch (error) {
      console.error("Error al actualizar orden de venta:", error);
      res.status(500).json({ error: "Error al actualizar orden de venta" });
    }
  });

  // Update sales order status
  router.patch("/:id/status", async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["pendiente", "confirmada", "en_preparacion", "lista", "entregada", "cancelada", "completada"];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      // Obtener la orden actual para saber los productos
      const [orders] = await connection.query(
        `SELECT id, status as current_status FROM sales_orders WHERE id = ?`,
        [id],
      );

      if (!orders || orders.length === 0) {
        await connection.release();
        return res.status(404).json({ error: "Orden no encontrada" });
      }

      const order = orders[0];

      // Iniciar transacción
      await connection.query("START TRANSACTION");

      try {
        // Actualizar el estado de la orden
        const [result] = await connection.query(
          `UPDATE sales_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
          [status, id],
        );

        // Si el estado nuevo es "entregada" o "completada" y no lo era antes, actualizar inventario
        if (
          (status === "entregada" || status === "completada") &&
          order.current_status !== "entregada" &&
          order.current_status !== "completada"
        ) {
          console.log(
            `✅ Orden de venta ${id} marcada como ${status}. Procesando inventario...`
          );

          // Obtener los items de la orden
          const [items] = await connection.query(
            `SELECT * FROM sales_order_items WHERE sales_order_id = ?`,
            [id],
          );

          // Procesar cada item de la orden
          for (const item of items) {
            console.log(
              `📦 Procesando producto ${item.product_id}: ${item.quantity} unidades`
            );

            // Obtener inventario actual
            const [inventories] = await connection.query(
              `SELECT * FROM inventory WHERE product_id = ?`,
              [item.product_id],
            );

            const currentInventory = inventories.length > 0 ? inventories[0] : null;
            const previousQuantity = currentInventory
              ? currentInventory.quantity
              : 0;
            const newQuantity = Math.max(0, previousQuantity - item.quantity);

            // Actualizar o crear inventario
            if (!currentInventory) {
              await connection.query(
                `INSERT INTO inventory (product_id, quantity, warehouse_location) VALUES (?, ?, ?)`,
                [item.product_id, newQuantity, "Almacén Principal"],
              );
              console.log(
                `✅ Inventario creado para producto ${item.product_id} con cantidad ${newQuantity}`
              );
            } else {
              await connection.query(
                `UPDATE inventory SET quantity = ?, last_updated = NOW() WHERE product_id = ?`,
                [newQuantity, item.product_id],
              );
              console.log(
                `✅ Inventario actualizado para producto ${item.product_id}: ${previousQuantity} -> ${newQuantity}`
              );
            }

            // Actualizar también la tabla products
            try {
              await connection.query(
                `UPDATE products SET stock_quantity = ?, updated_at = NOW() WHERE id = ?`,
                [newQuantity, item.product_id],
              );
              console.log(
                `✅ stock_quantity en products actualizado a ${newQuantity}`
              );
            } catch (productsError) {
              console.warn(
                `⚠️ Error actualizando products.stock_quantity:`,
                productsError.message
              );
            }

            // Registrar el movimiento en historial si la tabla existe
            try {
              // Mapear el tipo de movimiento al ENUM correcto
              // La tabla inventory_movements define: ENUM('entrada', 'salida', 'ajuste', 'devolución')
              const movementType = 'salida'; // Venta es una salida de inventario
              
              await connection.query(
                `
                INSERT INTO inventory_movements 
                (product_id, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `,
                [
                  item.product_id,
                  movementType,
                  -item.quantity,
                  previousQuantity,
                  newQuantity,
                  `Orden de venta #${id} ${status}`,
                  `Orden de venta "${id}" completada - Reducción de inventario`,
                ],
              );
              console.log(
                `✅ Movimiento de inventario registrado en historial`
              );
            } catch (historyError) {
              // Ignorar si la tabla no existe o si el tipo de movimiento es inválido
              if (historyError.code === "ER_NO_SUCH_TABLE") {
                console.warn(`⚠️ Tabla inventory_movements no existe`);
              } else if (historyError.code === "WARN_DATA_TRUNCATED" || historyError.sqlState === "01000") {
                console.warn(`⚠️ Tipo de movimiento no válido para inventory_movements (valores válidos: entrada, salida, ajuste, devolución)`);
              } else {
                // Solo relanzar si es un error crítico
                console.warn(`⚠️ Error al registrar movimiento (no crítico):`, historyError.message);
              }
            }
          }
        }

        await connection.query("COMMIT");
      } catch (txError) {
        await connection.query("ROLLBACK");
        throw txError;
      }

      res.json({
        message: "Estado actualizado exitosamente",
        id,
        status,
        inventoryUpdated:
          (status === "entregada" || status === "completada") &&
          order.current_status !== "entregada" &&
          order.current_status !== "completada",
      });
    } catch (error) {
      try {
        await connection.query("ROLLBACK");
      } catch (e) {
        console.error("Error en rollback:", e);
      }
      console.error("Error al actualizar estado:", error);
      res.status(500).json({ error: "Error al actualizar estado", details: error.message });
    } finally {
      await connection.release();
    }
  });

  // Delete sales order
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM sales_orders WHERE id = ?`, [id]);
      res.json({ message: "Orden de venta eliminada" });
    } catch (error) {
      console.error("Error al eliminar orden:", error);
      res.status(500).json({ error: "Error al eliminar orden" });
    }
  });

  // Update a specific sales order item
  router.patch("/:id/items/:itemId", async (req, res) => {
    try {
      const { id, itemId } = req.params;
      const { quantity, unit_price, total } = req.body;

      console.log("📝 ACTUALIZANDO ITEM DE ORDEN DE VENTA", {
        orderId: id,
        itemId,
        quantity,
        unit_price,
        total
      });

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
      }

      // Verificar que el item pertenece a la orden
      const [items] = await pool.query(
        `SELECT * FROM sales_order_items WHERE id = ? AND sales_order_id = ?`,
        [itemId, id]
      );

      console.log("📦 Items encontrados:", items);

      if (!items || items.length === 0) {
        return res.status(404).json({ error: "Item no encontrado en esta orden" });
      }

      const finalTotal = total || (quantity * unit_price);

      console.log("💾 Ejecutando UPDATE:", {
        quantity,
        unit_price: unit_price || items[0].unit_price,
        finalTotal,
        itemId,
        orderId: id
      });

      const updateResult = await pool.query(
        `UPDATE sales_order_items 
         SET quantity = ?, unit_price = ?, total = ?
         WHERE id = ? AND sales_order_id = ?`,
        [quantity, unit_price || items[0].unit_price, finalTotal, itemId, id]
      );

      console.log("✅ UPDATE resultado:", updateResult);

      // Actualizar el total de la orden
      const [totals] = await pool.query(
        `SELECT SUM(total) as order_total FROM sales_order_items WHERE sales_order_id = ?`,
        [id]
      );

      const newOrderTotal = totals[0]?.order_total || 0;

      console.log("📊 Nuevo total de orden:", newOrderTotal);

      await pool.query(
        `UPDATE sales_orders SET total_amount = ?, updated_at = NOW() WHERE id = ?`,
        [newOrderTotal, id]
      );

      res.json({
        message: "Item actualizado exitosamente",
        itemId,
        quantity,
        total: finalTotal,
        orderTotal: newOrderTotal
      });
    } catch (error) {
      console.error("Error al actualizar item:", error);
      res.status(500).json({ error: "Error al actualizar item", details: error.message });
    }
  });

  // Delete a specific sales order item
  router.delete("/:id/items/:itemId", async (req, res) => {
    try {
      const { id, itemId } = req.params;

      // Verificar que el item pertenece a la orden
      const [items] = await pool.query(
        `SELECT * FROM sales_order_items WHERE id = ? AND sales_order_id = ?`,
        [itemId, id]
      );

      if (!items || items.length === 0) {
        return res.status(404).json({ error: "Item no encontrado en esta orden" });
      }

      await pool.query(
        `DELETE FROM sales_order_items WHERE id = ? AND sales_order_id = ?`,
        [itemId, id]
      );

      // Actualizar el total de la orden
      const [totals] = await pool.query(
        `SELECT SUM(total) as order_total FROM sales_order_items WHERE sales_order_id = ?`,
        [id]
      );

      const newOrderTotal = totals[0]?.order_total || 0;

      await pool.query(
        `UPDATE sales_orders SET total_amount = ?, updated_at = NOW() WHERE id = ?`,
        [newOrderTotal, id]
      );

      res.json({
        message: "Item eliminado exitosamente",
        orderTotal: newOrderTotal
      });
    } catch (error) {
      console.error("Error al eliminar item:", error);
      res.status(500).json({ error: "Error al eliminar item", details: error.message });
    }
  });

  // Update sales order supplies
  router.patch("/:id/insumos/:insumoId", async (req, res) => {
    try {
      const { id, insumoId } = req.params;
      const { quantity_required, unit } = req.body;

      if (!quantity_required || quantity_required <= 0) {
        return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
      }

      // Verificar que el insumo pertenece a la orden
      const [insumos] = await pool.query(
        `SELECT * FROM sales_order_insumos WHERE id = ? AND sales_order_id = ?`,
        [insumoId, id]
      );

      if (!insumos || insumos.length === 0) {
        return res.status(404).json({ error: "Insumo no encontrado en esta orden" });
      }

      await pool.query(
        `UPDATE sales_order_insumos 
         SET quantity_required = ?, unit = ?, updated_at = NOW()
         WHERE id = ? AND sales_order_id = ?`,
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

  return router;
}
