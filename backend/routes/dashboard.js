import express from "express";
import {
  verifyToken,
  checkRole,
  authenticate,
} from "../middleware/auth.middleware.js";

export default function dashboardRoutes(pool) {
  const router = express.Router();

  // ✅ Ruta protegida con autenticación JWT
  // Ejemplo: GET /api/dashboard/stats
  // Header: Authorization: Bearer <token>
  router.get("/stats", verifyToken, async (req, res) => {
    try {
      const statsQueries = [
        {
          name: "monthly_sales",
          query:
            "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE MONTH(order_date) = MONTH(NOW()) AND YEAR(order_date) = YEAR(NOW())",
        },
        {
          name: "total_products",
          query: "SELECT COUNT(*) as total FROM products",
        },
        {
          name: "active_customers",
          query:
            'SELECT COUNT(*) as total FROM customers WHERE status = "active"',
        },
        {
          name: "pending_orders",
          query:
            'SELECT COUNT(*) as total FROM orders WHERE status = "pending"',
        },
      ];

      const stats = {};
      for (const item of statsQueries) {
        const [result] = await pool.query(item.query);
        stats[item.name] = result[0];
      }

      res.json(stats);
    } catch (error) {
      console.error("Error en dashboard stats:", error);
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });

  // Get sales and purchases data
  router.get("/charts", async (req, res) => {
    try {
      const salesQuery = `
        SELECT 
          MONTH(order_date) as month,
          SUM(total_amount) as ventas,
          0 as compras
        FROM orders
        WHERE YEAR(order_date) = YEAR(NOW())
        GROUP BY MONTH(order_date)
        ORDER BY MONTH(order_date)
      `;

      const [result] = await pool.query(salesQuery);
      const months = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      const chartData = result.map((row) => ({
        name: months[parseInt(row.month) - 1],
        ventas: parseFloat(row.ventas) || 0,
        compras: 0,
      }));

      res.json(chartData);
    } catch (error) {
      console.error("Error en charts:", error);
      res.status(500).json({ error: "Error al obtener datos de gráficos" });
    }
  });

  // Get recent alerts
  router.get("/alerts", async (req, res) => {
    try {
      const alertsQuery = `
        SELECT * FROM products WHERE stock_quantity < min_stock_level LIMIT 5
      `;

      const [result] = await pool.query(alertsQuery);

      const alerts = result.map((product) => ({
        text: `Stock bajo: ${product.name} (Solo ${product.stock_quantity} unidades)`,
        type: "warning",
      }));

      res.json(alerts);
    } catch (error) {
      console.error("Error en alertas:", error);
      res.status(500).json({ error: "Error al obtener alertas" });
    }
  });

  // Get recent activity
  router.get("/activity", async (req, res) => {
    try {
      const activityQuery = `
        SELECT 
          'Producto agregado al inventario' as action,
          'María García' as user,
          updated_at as time
        FROM products
        ORDER BY updated_at DESC
        LIMIT 5
      `;

      const [result] = await pool.query(activityQuery);

      const activity = result.map((row) => ({
        action: row.action,
        time: "Hace poco",
        user: row.user,
      }));

      res.json(activity);
    } catch (error) {
      console.error("Error en actividad:", error);
      res.status(500).json({ error: "Error al obtener actividad" });
    }
  });

  return router;
}
