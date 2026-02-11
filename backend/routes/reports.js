import express from "express";

export default function reportsRoutes(pool) {
  const router = express.Router();

  // Get sales report (últimos 30 días)
  router.get("/sales", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let query = `
        SELECT 
          DATE(order_date) as date,
          COUNT(*) as order_count,
          SUM(total_amount) as total_sales
        FROM sales_orders
        WHERE 1=1
      `;
      
      if (startDate) {
        query += ` AND DATE(order_date) >= '${startDate}'`;
      }
      if (endDate) {
        query += ` AND DATE(order_date) <= '${endDate}'`;
      }
      
      query += ` GROUP BY DATE(order_date) ORDER BY date DESC`;
      
      const [result] = await pool.query(query);
      res.json(result);
    } catch (error) {
      console.error("Error en reporte de ventas:", error);
      res.status(500).json({ error: "Error al obtener reporte de ventas" });
    }
  });

  // Get inventory report
  router.get("/inventory", async (req, res) => {
    try {
      const [result] = await pool.query(`
        SELECT p.id, p.name, p.sku, p.stock_quantity as quantity, p.price, 
               (p.stock_quantity * p.price) as total_value, p.min_stock_level
        FROM products p
        ORDER BY p.name
      `);
      res.json(result);
    } catch (error) {
      console.error("Error en reporte de inventario:", error);
      res.status(500).json({ error: "Error al obtener reporte de inventario" });
    }
  });

  // Get customer report
  router.get("/customers", async (req, res) => {
    try {
      const [result] = await pool.query(`
        SELECT 
          c.id,
          c.name,
          c.email,
          COUNT(o.id) as orders_count,
          COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM customers c
        LEFT JOIN sales_orders o ON c.id = o.customer_id
        GROUP BY c.id, c.name, c.email
        ORDER BY total_spent DESC
      `);
      res.json(result);
    } catch (error) {
      console.error("Error en reporte de clientes:", error);
      res.status(500).json({ error: "Error al obtener reporte de clientes" });
    }
  });

  // Get production orders report
  router.get("/production-orders", async (req, res) => {
    try {
      const { status } = req.query;
      
      let query = `
        SELECT 
          po.id,
          po.order_number,
          p.name as product_name,
          po.quantity,
          po.status,
          DATE(po.order_date) as order_date,
          CONCAT(e.first_name, ' ', e.last_name) as responsible_name
        FROM production_orders po
        LEFT JOIN products p ON po.product_id = p.id
        LEFT JOIN employees e ON po.responsible_employee_id = e.id
        WHERE 1=1
      `;
      
      if (status) {
        query += ` AND po.status = '${status}'`;
      }
      
      query += ` ORDER BY po.order_date DESC`;
      
      const [result] = await pool.query(query);
      res.json(result);
    } catch (error) {
      console.error("Error en reporte de órdenes de producción:", error);
      res.status(500).json({ error: "Error al obtener reporte de órdenes de producción" });
    }
  });

  // Get sales orders report
  router.get("/sales-orders", async (req, res) => {
    try {
      const { status, startDate, endDate } = req.query;
      
      let query = `
        SELECT 
          so.id,
          so.order_number,
          so.customer_name,
          so.total_amount,
          so.status,
          DATE(so.order_date) as order_date,
          COUNT(soi.id) as items_count
        FROM sales_orders so
        LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
        WHERE 1=1
      `;
      
      if (status) {
        query += ` AND so.status = '${status}'`;
      }
      if (startDate) {
        query += ` AND DATE(so.order_date) >= '${startDate}'`;
      }
      if (endDate) {
        query += ` AND DATE(so.order_date) <= '${endDate}'`;
      }
      
      query += ` GROUP BY so.id, so.order_number, so.customer_name, so.total_amount, so.status, so.order_date`;
      query += ` ORDER BY so.order_date DESC`;
      
      const [result] = await pool.query(query);
      res.json(result);
    } catch (error) {
      console.error("Error en reporte de órdenes de venta:", error);
      res.status(500).json({ error: "Error al obtener reporte de órdenes de venta" });
    }
  });

  // Get products report
  router.get("/products", async (req, res) => {
    try {
      const [result] = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.sku,
          p.category,
          p.price,
          p.stock_quantity,
          p.min_stock_level,
          (p.stock_quantity * p.price) as total_value,
          CASE 
            WHEN p.stock_quantity <= p.min_stock_level THEN 'Bajo'
            WHEN p.stock_quantity <= p.min_stock_level * 2 THEN 'Medio'
            ELSE 'Suficiente'
          END as stock_status
        FROM products p
        ORDER BY p.name
      `);
      res.json(result);
    } catch (error) {
      console.error("Error en reporte de productos:", error);
      res.status(500).json({ error: "Error al obtener reporte de productos" });
    }
  });

  // Get employees report
  router.get("/employees", async (req, res) => {
    try {
      const [result] = await pool.query(`
        SELECT 
          e.id,
          CONCAT(e.first_name, ' ', e.last_name) as name,
          e.position,
          e.email,
          e.phone,
          e.hire_date as start_date,
          COUNT(po.id) as production_orders_count
        FROM employees e
        LEFT JOIN production_orders po ON e.id = po.responsible_employee_id
        GROUP BY e.id, e.first_name, e.last_name, e.position, e.email, e.phone, e.hire_date
        ORDER BY e.first_name
      `);
      res.json(result);
    } catch (error) {
      console.error("Error en reporte de empleados:", error);
      res.status(500).json({ error: "Error al obtener reporte de empleados" });
    }
  });

  // Get summary report (dashboard)
  router.get("/summary", async (req, res) => {
    try {
      const [totalSales] = await pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total 
        FROM sales_orders
      `);
      
      const [totalProduction] = await pool.query(`
        SELECT COUNT(*) as count FROM production_orders
      `);
      
      const [totalProducts] = await pool.query(`
        SELECT COUNT(*) as count FROM products
      `);
      
      const [totalCustomers] = await pool.query(`
        SELECT COUNT(*) as count FROM customers
      `);

      res.json({
        total_sales: totalSales[0]?.total || 0,
        total_production_orders: totalProduction[0]?.count || 0,
        total_products: totalProducts[0]?.count || 0,
        total_customers: totalCustomers[0]?.count || 0
      });
    } catch (error) {
      console.error("Error en reporte resumen:", error);
      res.status(500).json({ error: "Error al obtener reporte resumen" });
    }
  });

  return router;
}
