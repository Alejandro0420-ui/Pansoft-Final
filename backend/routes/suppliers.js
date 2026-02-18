import express from "express";

export default function suppliersRoutes(pool) {
  const router = express.Router();

  // ⚠️ RUTAS ESPECÍFICAS PRIMERO (antes de /:id)

  // Toggle supplier status (deshabilitar/habilitar en lugar de eliminar)
  router.patch("/:id/toggle-status", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("🔄 PATCH toggle-status llamado para proveedor:", id);

      // Obtener el estado actual
      const [supplier] = await pool.query(
        "SELECT is_active FROM suppliers WHERE id = ?",
        [id],
      );

      if (supplier.length === 0) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }

      const newStatus = supplier[0].is_active ? 0 : 1;
      console.log(
        "📊 Estado actual:",
        supplier[0].is_active,
        "Nuevo estado:",
        newStatus,
      );

      // Actualizar el estado
      await pool.query("UPDATE suppliers SET is_active = ? WHERE id = ?", [
        newStatus,
        id,
      ]);

      console.log("✅ Proveedor actualizado - is_active:", newStatus);
      res.json({
        success: true,
        message: newStatus ? "Proveedor habilitado" : "Proveedor deshabilitado",
        is_active: newStatus,
      });
    } catch (error) {
      console.error("❌ Error al cambiar estado del proveedor:", error);
      res.status(500).json({ error: "Error al cambiar estado del proveedor" });
    }
  });

  // ⚠️ RUTAS GENÉRICAS DESPUÉS (/:id las captura)

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

  // Toggle supplier status (deshabilitar/habilitar en lugar de eliminar)
  // 🗑️ ELIMINADA - ya está arriba en rutas específicas

  // Delete supplier (deprecado - usaremos toggle-status)
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("🗑️🗑️🗑️ ¡¡¡DELETE ENDPOINT LLAMADO!!! para proveedor:", id);

      // En lugar de eliminar, deshabilitamos
      const [current] = await pool.query(
        "SELECT is_active, company_name FROM suppliers WHERE id = ?",
        [id],
      );

      if (current.length === 0) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }

      console.log("   Estado anterior:", current[0].is_active);
      await pool.query("UPDATE suppliers SET is_active = 0 WHERE id = ?", [id]);
      console.log(
        "   ✅ Proveedor:",
        current[0].company_name,
        "deshabilitado via DELETE",
      );

      res.json({ success: true, message: "Proveedor deshabilitado" });
    } catch (error) {
      console.error("❌ Error en DELETE:", error.message);
      res.status(500).json({ error: "Error al eliminar proveedor" });
    }
  });

  return router;
}
