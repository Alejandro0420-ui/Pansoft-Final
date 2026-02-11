import express from "express";

export default function ordersRoutes(pool) {
  const router = express.Router();

  // Get all orders
  router.get("/", async (req, res) => {
    try {
      const [result] = await pool.query(`
        SELECT o.*, c.name as customer_name FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        ORDER BY o.order_date DESC
      `);
      res.json(result);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
      res.status(500).json({ error: "Error al obtener órdenes" });
    }
  });

  // Get order by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [order] = await pool.query("SELECT * FROM orders WHERE id = ?", [
        id,
      ]);
      const [items] = await pool.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [id],
      );
      res.json({ ...order[0], items });
    } catch (error) {
      console.error("Error al obtener orden:", error);
      res.status(500).json({ error: "Error al obtener orden" });
    }
  });

  // Create order
  router.post("/", async (req, res) => {
    try {
      const { order_number, customer_id, delivery_date, total_amount, items } =
        req.body;
      const [result] = await pool.query(
        "INSERT INTO orders (order_number, customer_id, delivery_date, total_amount) VALUES (?, ?, ?, ?)",
        [order_number, customer_id, delivery_date, total_amount],
      );

      const orderId = result.insertId;

      // Insert order items
      for (const item of items || []) {
        await pool.query(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)",
          [
            orderId,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.total,
          ],
        );
      }

      res
        .status(201)
        .json({
          id: orderId,
          order_number,
          customer_id,
          delivery_date,
          total_amount,
        });
    } catch (error) {
      console.error("Error al crear orden:", error);
      res.status(500).json({ error: "Error al crear orden" });
    }
  });

  // Update order status
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await pool.query(
        "UPDATE orders SET status=?, updated_at=NOW() WHERE id=?",
        [status, id],
      );
      res.json({ id, status });
    } catch (error) {
      console.error("Error al actualizar orden:", error);
      res.status(500).json({ error: "Error al actualizar orden" });
    }
  });

  return router;
}
