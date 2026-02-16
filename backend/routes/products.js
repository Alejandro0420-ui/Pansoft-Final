import express from "express";
import upload from "../multerConfig.js";

export default function productsRoutes(pool) {
  const router = express.Router();

  // Get all products
  router.get("/", async (req, res) => {
    try {
      // Consulta simple para diagnóstico
      const [result] = await pool.query("SELECT * FROM products");
      res.json(result);
    } catch (error) {
      console.error("Error detallado al obtener productos:", error);
      res
        .status(500)
        .json({ error: "Error al obtener productos", details: error.message });
    }
  });

  // Get product by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query("SELECT * FROM products WHERE id = ?", [
        id,
      ]);
      res.json(result[0] || {});
    } catch (error) {
      console.error("Error al obtener producto:", error);
      res.status(500).json({ error: "Error al obtener producto" });
    }
  });

  // Create product with image
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
      } = req.body;
      const imageUrl = req.file ? `/images/${req.file.filename}` : null;

      const [result] = await pool.query(
        "INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          sku,
          description,
          category,
          price,
          stock_quantity,
          min_stock_level,
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
        image_url: imageUrl,
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      if (error.code === "ER_DUP_ENTRY") {
        res.status(409).json({
          error: `El SKU "${error.sqlMessage.match(/'([^']*)'/)?.[1] || "proporcionado"}" ya existe. Por favor usa un SKU único.`,
        });
      } else {
        res
          .status(500)
          .json({ error: "Error al crear producto: " + error.message });
      }
    }
  });

  // Update product
  router.put("/:id", upload.single("image"), async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        sku,
        description,
        category,
        price,
        stock_quantity,
        min_stock_level,
      } = req.body;

      let query =
        "UPDATE products SET name=?, sku=?, category=?, price=?, stock_quantity=?, min_stock_level=?, updated_at=NOW()";
      let params = [
        name,
        sku,
        category,
        price,
        stock_quantity,
        min_stock_level,
      ];

      // Agregar description solo si se proporciona
      if (description !== undefined && description !== null) {
        query =
          "UPDATE products SET name=?, sku=?, description=?, category=?, price=?, stock_quantity=?, min_stock_level=?, updated_at=NOW()";
        params = [
          name,
          sku,
          description,
          category,
          price,
          stock_quantity,
          min_stock_level,
        ];
      }

      if (req.file) {
        query += ", image_url=?";
        params.push(`/images/${req.file.filename}`);
      }

      query += " WHERE id=?";
      params.push(id);

      await pool.query(query, params);

      res.json({
        id,
        name,
        sku,
        description,
        category,
        price,
        stock_quantity,
        min_stock_level,
      });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).json({ error: "Error al actualizar producto" });
    }
  });

  // Disable product (soft delete)
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        "UPDATE products SET is_active = false, updated_at = NOW() WHERE id = ?",
        [id],
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error al deshabilitar producto:", error);
      res.status(500).json({ error: "Error al deshabilitar producto" });
    }
  });

  // Toggle product status
  router.patch("/:id/toggle-status", async (req, res) => {
    try {
      const { id } = req.params;

      // Obtener estado actual
      const [current] = await pool.query(
        "SELECT is_active FROM products WHERE id = ?",
        [id],
      );

      if (!current.length) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      const newStatus = !current[0].is_active;

      // Cambiar estado
      await pool.query(
        "UPDATE products SET is_active = ?, updated_at = NOW() WHERE id = ?",
        [newStatus, id],
      );

      res.json({ success: true, is_active: newStatus });
    } catch (error) {
      console.error("Error al cambiar estado del producto:", error);
      res.status(500).json({
        error: "Error al cambiar estado del producto",
        details: error.message,
      });
    }
  });

  return router;
}
