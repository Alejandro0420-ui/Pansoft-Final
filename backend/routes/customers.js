import express from "express";

export default function customersRoutes(pool) {
  const router = express.Router();

  // Get all customers
  router.get("/", async (req, res) => {
    try {
      const [result] = await pool.query(
        "SELECT id, name, email, phone, address, city, country, customer_type, status, created_at, updated_at FROM customers ORDER BY name",
      );
      res.json(result);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      res.status(500).json({ error: "Error al obtener clientes" });
    }
  });

  // Get customer by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        "SELECT * FROM customers WHERE id = ?",
        [id],
      );
      res.json(result[0] || {});
    } catch (error) {
      console.error("Error al obtener cliente:", error);
      res.status(500).json({ error: "Error al obtener cliente" });
    }
  });

  // Create customer
  router.post("/", async (req, res) => {
    try {
      const { name, email, phone, address, city, country, customer_type } =
        req.body;

      if (!name) {
        return res.status(400).json({ error: "El nombre es requerido" });
      }

      const [result] = await pool.query(
        "INSERT INTO customers (name, email, phone, address, city, country, customer_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          email || null,
          phone || null,
          address || null,
          city || null,
          country || null,
          customer_type || null,
        ],
      );

      res.status(201).json({
        id: result.insertId,
        name,
        email,
        phone,
        address,
        city,
        country,
        customer_type,
      });
    } catch (error) {
      console.error("Error al crear cliente:", error);
      res
        .status(500)
        .json({ error: "Error al crear cliente: " + error.message });
    }
  });

  // Update customer
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, address, city, country, customer_type } =
        req.body;

      await pool.query(
        "UPDATE customers SET name=?, email=?, phone=?, address=?, city=?, country=?, customer_type=?, updated_at=NOW() WHERE id=?",
        [name, email, phone, address, city, country, customer_type, id],
      );

      res.json({
        id,
        name,
        email,
        phone,
        address,
        city,
        country,
        customer_type,
      });
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      res.status(500).json({ error: "Error al actualizar cliente" });
    }
  });

  // Delete customer
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM customers WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      res.status(500).json({ error: "Error al eliminar cliente" });
    }
  });

  return router;
}
