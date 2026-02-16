/**
 * Utilidades para generar notificaciones automáticas
 * Este módulo exporta funciones para crear notificaciones en diversos eventos
 */

export const notificationService = {
  /**
   * Crear notificación de factura vencida
   */
  overdueBilling: (invoiceNumber, daysOverdue, amount) => ({
    type: "warning",
    title: "💳 Factura vencida",
    message: `Factura #${invoiceNumber} vencida hace ${daysOverdue} días. Monto: $${amount}`,
    icon: "AlertTriangle",
    color: "#FF6B6B",
  }),

  /**
   * Crear notificación de factura por vencer
   */
  billingDueSoon: (invoiceNumber, daysUntilDue, amount) => ({
    type: "info",
    title: "Factura próxima a vencer",
    message: `Factura #${invoiceNumber} vence en ${daysUntilDue} días. Monto: $${amount}`,
    icon: "Info",
    color: "#FFD93D",
  }),

  /**
   * Crear notificación de producta con stock bajo
   */
  lowStockProduct: (productName, currentQuantity, minQuantity) => ({
    type: "inventory",
    title: "Producto con stock bajo",
    message: `${productName} tiene solo ${currentQuantity} unidades (mínimo: ${minQuantity})`,
    icon: "Package",
    color: "#FFD93D",
  }),

  /**
   * Crear notificación de insumo con stock bajo
   */
  lowStockSupply: (supplyName, currentQuantity, minQuantity) => ({
    type: "inventory",
    title: "Insumo con stock bajo",
    message: `${supplyName} tiene solo ${currentQuantity} unidades (mínimo: ${minQuantity})`,
    icon: "AlertCircle",
    color: "#FFA500",
  }),

  /**
   * Crear notificación de stock crítico
   */
  criticalStock: (productName, currentQuantity, minQuantity) => ({
    type: "warning",
    title: "Stock crítico",
    message: `${productName} tiene solo ${currentQuantity} unidades (mínimo crítico: ${minQuantity})`,
    icon: "AlertTriangle",
    color: "#FF6B6B",
  }),
};

/**
 * Función para crear una notificación en la base de datos
 * Usa la función createNotification del router de notificaciones
 */
export async function createNotification(pool, notification, userId = null) {
  try {
    await pool.query(
      `INSERT INTO notifications (type, title, message, icon, color, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        notification.type,
        notification.title,
        notification.message,
        notification.icon || null,
        notification.color || null,
        userId,
      ],
    );
    console.log("✓ Notificación creada:", notification.title);
  } catch (error) {
    console.error("Error al crear notificación:", error);
  }
}

/**
 * Función para verificar y crear notificaciones de facturas vencidas
 */
export async function checkOverdueInvoices(pool) {
  try {
    // Obtener facturas vencidas
    const [overdueInvoices] = await pool.query(`
      SELECT i.id, i.invoice_number, i.due_date, i.total_amount,
             DATEDIFF(NOW(), i.due_date) as days_overdue
      FROM invoices i
      WHERE i.due_date < NOW()
      AND i.status != 'paid'
      AND i.status != 'cancelled'
      ORDER BY i.due_date ASC
    `);

    for (const invoice of overdueInvoices) {
      // Verificar si ya existe notificación para esta factura
      const [existing] = await pool.query(
        "SELECT id FROM notifications WHERE type = 'warning' AND message LIKE ? LIMIT 1",
        [`%${invoice.invoice_number}%`],
      );

      if (existing.length === 0) {
        const notification = notificationService.overdueBilling(
          invoice.invoice_number,
          invoice.days_overdue,
          invoice.total_amount,
        );
        await createNotification(pool, notification);
      }
    }

    console.log(`✓ Verificadas ${overdueInvoices.length} facturas vencidas`);
  } catch (error) {
    console.error("Error en checkOverdueInvoices:", error);
  }
}

/**
 * Función para verificar y crear notificaciones de facturas próximas a vencer
 */
export async function checkUpcomingDueDates(pool, daysWarning = 3) {
  try {
    // Obtener facturas próximas a vencer
    const [upcomingInvoices] = await pool.query(
      `
      SELECT i.id, i.invoice_number, i.due_date, i.total_amount,
             DATEDIFF(i.due_date, NOW()) as days_until_due
      FROM invoices i
      WHERE i.due_date > NOW()
      AND DATEDIFF(i.due_date, NOW()) <= ?
      AND i.status != 'paid'
      AND i.status != 'cancelled'
      ORDER BY i.due_date ASC
    `,
      [daysWarning],
    );

    for (const invoice of upcomingInvoices) {
      // Verificar si ya existe notificación para esta factura
      const [existing] = await pool.query(
        "SELECT id FROM notifications WHERE type = 'info' AND message LIKE ? LIMIT 1",
        [`%próxima%${invoice.invoice_number}%`],
      );

      if (existing.length === 0) {
        const notification = notificationService.billingDueSoon(
          invoice.invoice_number,
          invoice.days_until_due,
          invoice.total_amount,
        );
        await createNotification(pool, notification);
      }
    }

    console.log(
      `✓ Verificadas ${upcomingInvoices.length} facturas próximas a vencer`,
    );
  } catch (error) {
    console.error("Error en checkUpcomingDueDates:", error);
  }
}

/**
 * Función para verificar y crear notificaciones de stock crítico
 */
export async function checkCriticalStock(pool) {
  try {
    // Obtener productos con stock crítico (por debajo del 30% del mínimo)
    const [criticalProducts] = await pool.query(`
      SELECT p.id, p.name, p.sku, p.stock_quantity, p.min_stock_level,
             ROUND((p.stock_quantity / p.min_stock_level) * 100, 2) as stock_percentage
      FROM products p
      WHERE (p.is_active = 1 OR p.is_active IS NULL)
      AND p.min_stock_level > 0
      AND p.stock_quantity <= (p.min_stock_level * 0.3)
      ORDER BY stock_percentage ASC
    `);

    for (const product of criticalProducts) {
      const currentQuantity = product.stock_quantity || 0;

      // Verificar si ya existe notificación reciente para este producto
      const [existing] = await pool.query(
        "SELECT id FROM notifications WHERE type = 'warning' AND message LIKE ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY) LIMIT 1",
        [`%${product.name}%`],
      );

      if (existing.length === 0) {
        const notification = notificationService.criticalStock(
          product.name,
          currentQuantity,
          product.min_stock_level,
        );
        await createNotification(pool, notification);
      }
    }

    console.log(
      `✓ Verificados ${criticalProducts.length} productos con stock crítico`,
    );
  } catch (error) {
    console.error("Error en checkCriticalStock:", error);
  }
}

/**
 * Función para verificar y crear notificaciones de productos con stock bajo
 */
export async function checkLowStockProducts(pool) {
  try {
    // Obtener productos con bajo stock (entre 30% y 100% del mínimo)
    const [lowStockProducts] = await pool.query(`
      SELECT p.id, p.name, p.sku, p.stock_quantity, p.min_stock_level,
             ROUND((p.stock_quantity / p.min_stock_level) * 100, 2) as stock_percentage
      FROM products p
      WHERE (p.is_active = 1 OR p.is_active IS NULL)
      AND p.min_stock_level > 0
      AND p.stock_quantity > (p.min_stock_level * 0.3) AND p.stock_quantity <= p.min_stock_level
      ORDER BY stock_percentage ASC
    `);

    for (const product of lowStockProducts) {
      const currentQuantity = product.stock_quantity || 0;

      // Verificar si ya existe notificación reciente para este producto
      const [existing] = await pool.query(
        "SELECT id FROM notifications WHERE type = 'inventory' AND title = 'Producto con stock bajo' AND message LIKE ? AND created_at > DATE_SUB(NOW(), INTERVAL 6 HOUR) LIMIT 1",
        [`%${product.name}%`],
      );

      if (existing.length === 0) {
        const notification = notificationService.lowStockProduct(
          product.name,
          currentQuantity,
          product.min_stock_level,
        );
        await createNotification(pool, notification);
      }
    }

    console.log(
      `✓ Verificados ${lowStockProducts.length} productos con stock bajo`,
    );
  } catch (error) {
    console.error("Error en checkLowStockProducts:", error);
  }
}

/**
 * Función para verificar y crear notificaciones de insumos con stock bajo
 */
export async function checkLowStockSupplies(pool) {
  try {
    // Obtener insumos con bajo stock
    const [lowStockSupplies] = await pool.query(`
      SELECT s.id, s.name, s.sku, s.stock_quantity, s.min_stock_level,
             ROUND((s.stock_quantity / s.min_stock_level) * 100, 2) as stock_percentage
      FROM supplies s
      WHERE (s.is_active = 1 OR s.is_active IS NULL)
      AND s.min_stock_level > 0
      AND s.stock_quantity > (s.min_stock_level * 0.3) AND s.stock_quantity <= s.min_stock_level
      ORDER BY stock_percentage ASC
    `);

    for (const supply of lowStockSupplies) {
      const currentQuantity = supply.stock_quantity || 0;

      // Verificar si ya existe notificación reciente para este insumo
      const [existing] = await pool.query(
        "SELECT id FROM notifications WHERE type = 'inventory' AND message LIKE ? AND created_at > DATE_SUB(NOW(), INTERVAL 6 HOUR) LIMIT 1",
        [`%${supply.name}%bajo%`],
      );

      if (existing.length === 0) {
        const notification = notificationService.lowStockSupply(
          supply.name,
          currentQuantity,
          supply.min_stock_level,
        );
        await createNotification(pool, notification);
      }
    }

    console.log(
      `✓ Verificados ${lowStockSupplies.length} insumos con stock bajo`,
    );
  } catch (error) {
    console.error("Error en checkLowStockSupplies:", error);
  }
}
