-- Queries útiles para el módulo de Órdenes

-- ========================================
-- VER TODAS LAS ÓRDENES DE PRODUCCIÓN
-- ========================================
SELECT 
  po.id,
  po.order_number,
  p.name as product_name,
  po.quantity,
  CONCAT(e.first_name, ' ', e.last_name) as responsible,
  po.due_date,
  po.status,
  po.created_at
FROM production_orders po
LEFT JOIN products p ON po.product_id = p.id
LEFT JOIN employees e ON po.responsible_employee_id = e.id
ORDER BY po.created_at DESC;

-- ========================================
-- VER ÓRDENES DE VENTA CON CLIENTE
-- ========================================
SELECT 
  so.id,
  so.order_number,
  c.name as customer_name,
  so.order_date,
  so.delivery_date,
  so.total_amount,
  so.status
FROM sales_orders so
LEFT JOIN customers c ON so.customer_id = c.id
ORDER BY so.order_date DESC;

-- ========================================
-- VER INSUMOS DE UNA ORDEN DE PRODUCCIÓN
-- ========================================
SELECT 
  pos.id,
  s.name as supply_name,
  pos.quantity_required,
  pos.unit,
  s.stock_quantity,
  s.unit as stock_unit,
  CASE 
    WHEN s.stock_quantity >= pos.quantity_required THEN 'OK'
    ELSE 'INSUFICIENTE'
  END as stock_status
FROM production_order_supplies pos
LEFT JOIN supplies s ON pos.supply_id = s.id
WHERE pos.production_order_id = 1
ORDER BY s.name ASC;

-- ========================================
-- VER INSUMOS CON BAJO STOCK
-- ========================================
SELECT 
  id,
  name,
  stock_quantity,
  min_stock_level,
  unit,
  ROUND((stock_quantity / min_stock_level) * 100, 2) as percentage
FROM supplies
WHERE stock_quantity < min_stock_level
ORDER BY stock_quantity ASC;

-- ========================================
-- CONTAR ÓRDENES POR ESTADO
-- ========================================
SELECT 
  'Producción' as tipo,
  status,
  COUNT(*) as total
FROM production_orders
GROUP BY status

UNION ALL

SELECT 
  'Venta' as tipo,
  status,
  COUNT(*) as total
FROM sales_orders
GROUP BY status;

-- ========================================
-- ÓRDENES DE PRODUCCIÓN PRÓXIMAS A VENCER
-- ========================================
SELECT 
  po.order_number,
  p.name as product_name,
  po.quantity,
  CONCAT(e.first_name, ' ', e.last_name) as responsible,
  po.due_date,
  DATEDIFF(po.due_date, CURDATE()) as days_left
FROM production_orders po
LEFT JOIN products p ON po.product_id = p.id
LEFT JOIN employees e ON po.responsible_employee_id = e.id
WHERE po.status != 'completada' 
  AND po.status != 'cancelada'
  AND DATEDIFF(po.due_date, CURDATE()) BETWEEN 0 AND 7
ORDER BY po.due_date ASC;

-- ========================================
-- TOTAL DE INSUMOS REQUERIDOS POR PRODUCTO
-- ========================================
SELECT 
  p.name as product_name,
  COUNT(DISTINCT pos.supply_id) as unique_supplies,
  SUM(pos.quantity_required) as total_quantity_required
FROM production_orders po
LEFT JOIN products p ON po.product_id = p.id
LEFT JOIN production_order_supplies pos ON po.id = pos.production_order_id
WHERE po.status != 'cancelada'
GROUP BY p.name;

-- ========================================
-- VER DETALLES COMPLETOS DE UNA ORDEN
-- ========================================
SELECT 
  po.order_number,
  po.id,
  p.name as product_name,
  po.quantity,
  CONCAT(e.first_name, ' ', e.last_name) as responsible,
  po.due_date,
  po.status,
  po.notes,
  po.created_at,
  po.updated_at
FROM production_orders po
LEFT JOIN products p ON po.product_id = p.id
LEFT JOIN employees e ON po.responsible_employee_id = e.id
WHERE po.order_number = 'PROD-001';

-- ========================================
-- ACTUALIZAR ESTADO DE ORDEN
-- ========================================
UPDATE production_orders 
SET status = 'completada', updated_at = NOW()
WHERE order_number = 'PROD-001';

-- ========================================
-- RECUENTO DE ÓRDENES POR EMPLEADO
-- ========================================
SELECT 
  CONCAT(e.first_name, ' ', e.last_name) as employee,
  COUNT(po.id) as total_orders,
  SUM(CASE WHEN po.status = 'completada' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN po.status = 'pendiente' THEN 1 ELSE 0 END) as pending
FROM production_orders po
LEFT JOIN employees e ON po.responsible_employee_id = e.id
GROUP BY e.id
ORDER BY total_orders DESC;

-- ========================================
-- ÓRDENES MÁS RECIENTES
-- ========================================
SELECT 
  'Producción' as tipo,
  order_number,
  created_at,
  status
FROM production_orders
LIMIT 10

UNION ALL

SELECT 
  'Venta' as tipo,
  order_number,
  order_date as created_at,
  status
FROM sales_orders
LIMIT 10

ORDER BY created_at DESC;

-- ========================================
-- ESTADÍSTICAS GENERALES
-- ========================================
SELECT 
  (SELECT COUNT(*) FROM production_orders) as total_produccion_orders,
  (SELECT COUNT(*) FROM sales_orders) as total_sales_orders,
  (SELECT COUNT(*) FROM supplies) as total_supplies,
  (SELECT COUNT(*) FROM supplies WHERE stock_quantity < min_stock_level) as low_stock_supplies,
  (SELECT SUM(total_amount) FROM sales_orders WHERE status = 'completed') as total_sales_completed;

-- ========================================
-- BÚSQUEDA DE ÓRDENES
-- ========================================
-- Búsqueda por número de orden
SELECT * FROM production_orders WHERE order_number LIKE 'PROD%' ORDER BY order_number DESC;

-- Búsqueda por producto
SELECT po.*, p.name 
FROM production_orders po
LEFT JOIN products p ON po.product_id = p.id
WHERE p.name LIKE '%Pan%';

-- Búsqueda por empleado
SELECT po.*, e.first_name, e.last_name
FROM production_orders po
LEFT JOIN employees e ON po.responsible_employee_id = e.id
WHERE e.first_name LIKE '%María%' OR e.last_name LIKE '%García%';

-- ========================================
-- ELIMINAR ÓRDENES ANTIGUAS (Cuidado!)
-- ========================================
-- BACKUP antes de ejecutar:
-- mysqldump -u root -p pansoft_db > backup.sql

-- Eliminar órdenes canceladas más de 6 meses atrás
DELETE FROM production_orders
WHERE status = 'cancelada' 
  AND created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- ========================================
-- RESTAURAR CONTRASEÑA DE BD
-- ========================================
-- Si olvidas la contraseña (solo para desarrollo):
-- mysql -u root
-- ALTER USER 'root'@'localhost' IDENTIFIED BY 'nueva_contraseña';
-- FLUSH PRIVILEGES;
