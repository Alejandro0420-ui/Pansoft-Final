import express from "express";

export default function notificationsRoutes(pool) {
  const router = express.Router();

  // Crear tabla de notificaciones si no existe
  async function ensureNotificationsTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          icon VARCHAR(50),
          color VARCHAR(50),
          is_read BOOLEAN DEFAULT FALSE,
          user_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_is_read (is_read),
          INDEX idx_created_at (created_at)
        )
      `);
      console.log("✓ Tabla de notificaciones verificada");
    } catch (error) {
      console.error("Error al crear tabla de notificaciones:", error);
    }
  }

  // Inicializar tabla
  ensureNotificationsTable();

  // Función auxiliar para crear notificaciones
  async function createNotification(
    type,
    title,
    message,
    icon = null,
    color = null,
    userId = null,
  ) {
    try {
      await pool.query(
        `INSERT INTO notifications (type, title, message, icon, color, user_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [type, title, message, icon, color, userId],
      );
    } catch (error) {
      console.error("Error al crear notificación:", error);
    }
  }

  // GET todas las notificaciones
  router.get("/", async (req, res) => {
    try {
      const { unreadOnly = false, limit = 50, offset = 0 } = req.query;

      let query = "SELECT * FROM notifications";
      const params = [];

      if (unreadOnly === "true") {
        query += " WHERE is_read = FALSE";
      }

      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.push(parseInt(limit), parseInt(offset));

      const [notifications] = await pool.query(query, params);

      // Obtener total
      let countQuery = "SELECT COUNT(*) as total FROM notifications";
      if (unreadOnly === "true") {
        countQuery += " WHERE is_read = FALSE";
      }
      const [countResult] = await pool.query(countQuery);

      res.json({
        notifications,
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      res.status(500).json({ error: "Error al obtener notificaciones" });
    }
  });

  // GET notificaciones por tipo
  router.get("/by-type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const [notifications] = await pool.query(
        "SELECT * FROM notifications WHERE type = ? ORDER BY created_at DESC LIMIT 50",
        [type],
      );
      res.json(notifications);
    } catch (error) {
      console.error("Error al obtener notificaciones por tipo:", error);
      res.status(500).json({ error: "Error al obtener notificaciones" });
    }
  });

  // GET notificaciones sin leer
  router.get("/unread/count", async (req, res) => {
    try {
      const [result] = await pool.query(
        "SELECT COUNT(*) as unreadCount FROM notifications WHERE is_read = FALSE",
      );
      res.json(result[0]);
    } catch (error) {
      console.error("Error al contar notificaciones sin leer:", error);
      res.status(500).json({ error: "Error al contar notificaciones" });
    }
  });

  // PATCH marcar como leída
  router.patch("/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [
        id,
      ]);
      res.json({ success: true, message: "Notificación marcada como leída" });
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      res.status(500).json({ error: "Error al actualizar notificación" });
    }
  });

  // PATCH marcar todas como leídas
  router.patch("/read/all", async (req, res) => {
    try {
      const result = await pool.query(
        "UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE",
      );
      res.json({
        success: true,
        message: "Todas las notificaciones marcadas como leídas",
      });
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
      res.status(500).json({ error: "Error al actualizar notificaciones" });
    }
  });

  // DELETE notificación
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM notifications WHERE id = ?", [id]);
      res.json({ success: true, message: "Notificación eliminada" });
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      res.status(500).json({ error: "Error al eliminar notificación" });
    }
  });

  // DELETE todas las notificaciones leídas
  router.delete("/read/all", async (req, res) => {
    try {
      await pool.query("DELETE FROM notifications WHERE is_read = TRUE");
      res.json({ success: true, message: "Notificaciones leídas eliminadas" });
    } catch (error) {
      console.error("Error al eliminar notificaciones:", error);
      res.status(500).json({ error: "Error al eliminar notificaciones" });
    }
  });

  // Exportar función para generar notificaciones
  router.createNotification = createNotification;

  return router;
}
