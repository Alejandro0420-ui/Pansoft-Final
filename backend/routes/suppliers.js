import express from "express";

export default function suppliersRoutes(pool) {
  const router = express.Router();

  // Get all suppliers
  router.get("/", async (req, res) => {
    try {
      const [result] = await pool.query(
        "SELECT * FROM suppliers ORDER BY company_name",
      );
      res.json(result);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      res.status(500).json({ error: "Error al obtener proveedores" });
    }
  });

  // Get supplier by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        "SELECT * FROM suppliers WHERE id = ?",
        [id],
      );
      res.json(result[0] || {});
    } catch (error) {
      console.error("Error al obtener proveedor:", error);
      res.status(500).json({ error: "Error al obtener proveedor" });
    }
  });

  // Create supplier
  router.post("/", async (req, res) => {
    try {
      const {
        company_name,
        contact_person,
        email,
        phone,
        address,
        city,
        country,
        payment_terms,
        category,
      } = req.body;
      const [result] = await pool.query(
        "INSERT INTO suppliers (company_name, contact_person, email, phone, address, city, country, payment_terms, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          company_name,
          contact_person,
          email,
          phone,
          address,
          city,
          country,
          payment_terms,
          category,
        ],
      );
      res.status(201).json({
        id: result.insertId,
        company_name,
        contact_person,
        email,
        phone,
        address,
        city,
        country,
        payment_terms,
        category,
      });
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      res.status(500).json({ error: "Error al crear proveedor" });
    }
  });

  // Update supplier
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        company_name,
        contact_person,
        email,
        phone,
        address,
        city,
        country,
        payment_terms,
        category,
      } = req.body;
      await pool.query(
        "UPDATE suppliers SET company_name=?, contact_person=?, email=?, phone=?, address=?, city=?, country=?, payment_terms=?, category=?, updated_at=NOW() WHERE id=?",
        [
          company_name,
          contact_person,
          email,
          phone,
          address,
          city,
          country,
          payment_terms,
          category,
          id,
        ],
      );
      res.json({
        id,
        company_name,
        contact_person,
        email,
        phone,
        address,
        city,
        country,
        payment_terms,
        category,
      });
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      res.status(500).json({ error: "Error al actualizar proveedor" });
    }
  });

  // Delete supplier
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM suppliers WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      res.status(500).json({ error: "Error al eliminar proveedor" });
    }
  });

  return router;
}
