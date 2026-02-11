import express from "express";

// Función para generar un número de factura único
async function generateUniqueInvoiceNumber(pool) {
  let invoiceNumber;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    invoiceNumber = `FAC-${timestamp}-${random}`;

    const [existing] = await pool.query(
      "SELECT id FROM invoices WHERE invoice_number = ?",
      [invoiceNumber],
    );

    if (existing.length === 0) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error(
      "No se pudo generar un número de factura único después de varios intentos",
    );
  }

  return invoiceNumber;
}

export default function billingRoutes(pool) {
  const router = express.Router();

  // Get all invoices
  router.get("/", async (req, res) => {
    try {
      const [result] = await pool.query(`
        SELECT i.*, c.name as customer_name FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.issue_date DESC
      `);
      res.json(result);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      res.status(500).json({ error: "Error al obtener facturas" });
    }
  });

  // Get invoice by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query("SELECT * FROM invoices WHERE id = ?", [
        id,
      ]);
      res.json(result[0] || {});
    } catch (error) {
      console.error("Error al obtener factura:", error);
      res.status(500).json({ error: "Error al obtener factura" });
    }
  });

  // Create invoice
  router.post("/", async (req, res) => {
    try {
      let {
        invoice_number,
        order_id,
        customer_id,
        issue_date,
        due_date,
        total_amount,
      } = req.body;

      // Generar invoice_number automáticamente si no se proporciona o validar unicidad
      if (!invoice_number) {
        invoice_number = await generateUniqueInvoiceNumber(pool);
      } else {
        // Validar que el número de factura sea único
        const [existing] = await pool.query(
          "SELECT id FROM invoices WHERE invoice_number = ?",
          [invoice_number],
        );
        if (existing.length > 0) {
          return res.status(400).json({
            error: `El número de factura ${invoice_number} ya existe. Se generará uno nuevo automáticamente.`,
          });
        }
      }

      const [result] = await pool.query(
        "INSERT INTO invoices (invoice_number, order_id, customer_id, issue_date, due_date, total_amount) VALUES (?, ?, ?, ?, ?, ?)",
        [
          invoice_number,
          order_id,
          customer_id,
          issue_date,
          due_date,
          total_amount,
        ],
      );
      res.status(201).json({
        id: result.insertId,
        invoice_number,
        order_id,
        customer_id,
        issue_date,
        due_date,
        total_amount,
      });
    } catch (error) {
      console.error("Error al crear factura:", error);
      res.status(500).json({ error: "Error al crear factura" });
    }
  });

  // Update invoice
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paid_amount } = req.body;
      await pool.query(
        "UPDATE invoices SET status=?, paid_amount=?, updated_at=NOW() WHERE id=?",
        [status, paid_amount, id],
      );
      res.json({ id, status, paid_amount });
    } catch (error) {
      console.error("Error al actualizar factura:", error);
      res.status(500).json({ error: "Error al actualizar factura" });
    }
  });

  // Delete invoice
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM invoices WHERE id = ?", [id]);
      res.json({ id, message: "Factura eliminada exitosamente" });
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      res.status(500).json({ error: "Error al eliminar factura" });
    }
  });

  return router;
}
