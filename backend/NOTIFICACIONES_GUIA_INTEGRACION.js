/**
 * GUÍA DE INTEGRACIÓN - NOTIFICACIONES
 *
 * Este archivo explica cómo integrar el sistema de notificaciones
 * en los diferentes módulos del backend.
 */

/**
 * EJEMPLO 1: Crear notificación cuando se crea una orden
 * Ubicación: routes/orders.js
 */
const ejemplo1 = `
import { createNotification, notificationService } from "./notificationService.js";

// En el endpoint POST /api/orders (crear orden)
export default function ordersRoutes(pool) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    try {
      // ... código para crear orden ...
      
      const orderId = result.insertId;
      const customerId = req.body.customer_id;
      
      // Obtener nombre del cliente
      const [customer] = await pool.query(
        "SELECT name FROM customers WHERE id = ?",
        [customerId]
      );
      
      // Crear notificación
      const notification = notificationService.orderCreated(
        orderId,
        customer[0].name
      );
      await createNotification(pool, notification);
      
      res.json({ success: true, orderId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
`;

/**
 * EJEMPLO 2: Crear notificación cuando inventario es bajo
 * Ubicación: routes/inventory.js
 */
const ejemplo2 = `
import { createNotification, notificationService } from "./notificationService.js";

// En cualquier endpoint que actualice inventario
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    // Actualizar inventario
    await pool.query(
      "UPDATE inventory SET quantity = ? WHERE id = ?",
      [quantity, id]
    );
    
    // Obtener datos del producto
    const [product] = await pool.query(
      "SELECT p.name, p.min_stock_level FROM products p WHERE p.id = ?",
      [id]
    );
    
    // Verificar si está bajo stock
    if (quantity <= product[0].min_stock_level) {
      const notification = notificationService.lowStock(
        product[0].name,
        quantity,
        product[0].min_stock_level
      );
      await createNotification(pool, notification);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
`;

/**
 * EJEMPLO 3: Crear notificación cuando se completa una orden
 * Ubicación: routes/orders.js
 */
const ejemplo3 = `
// En endpoint PATCH /api/orders/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Actualizar estado de orden
    await pool.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, id]
    );
    
    // Si se completa, crear notificación
    if (status === "completed") {
      const [order] = await pool.query(
        "SELECT o.id, c.name FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?",
        [id]
      );
      
      const notification = notificationService.orderCompleted(
        order[0].id,
        order[0].name
      );
      await createNotification(pool, notification);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
`;

/**
 * EJEMPLO 4: Crear notificación cuando se registra un nuevo empleado
 * Ubicación: routes/employees.js
 */
const ejemplo4 = `
// En endpoint POST /api/employees
router.post("/", async (req, res) => {
  try {
    const { full_name, email, position } = req.body;
    
    // Crear empleado
    const result = await pool.query(
      "INSERT INTO employees (full_name, email, position) VALUES (?, ?, ?)",
      [full_name, email, position]
    );
    
    // Crear notificación
    const notification = notificationService.employeeAdded(full_name);
    await createNotification(pool, notification);
    
    res.json({ success: true, employeeId: result[0].insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
`;

/**
 * EJEMPLO 5: Usar verificación automática de bajo stock en inventario
 * Ubicación: server.js
 */
const ejemplo5 = `
import { checkLowStockProducts, checkLowStockSupplies } from "./routes/notificationService.js";

// Agregar esto después de iniciar el servidor
startServer().then(() => {
  // Verificar bajo stock de productos cada 45 minutos
  setInterval(() => checkLowStockProducts(pool), 2700000);
  
  // Verificar bajo stock de insumos cada 45 minutos
  setInterval(() => checkLowStockSupplies(pool), 2700000);
});
`;

console.log("✓ Guía de integración de notificaciones cargada");
