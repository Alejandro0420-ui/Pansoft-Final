-- Script de datos de ejemplo para pruebas del módulo de Órdenes

-- Agregar insumos de ejemplo
INSERT INTO supplies (name, description, unit, stock_quantity, min_stock_level, unit_price, status) VALUES
('Harina de Trigo', 'Harina de trigo refinada premium', 'kg', 500, 50, 2500, 'active'),
('Azúcar Blanca', 'Azúcar blanca granulada', 'kg', 80, 20, 3000, 'active'),
('Levadura Seca', 'Levadura seca instantánea', 'kg', 15, 5, 45000, 'active'),
('Mantequilla', 'Mantequilla sin sal', 'kg', 45, 10, 8000, 'active'),
('Huevos', 'Huevos frescos de granja', 'unidades', 120, 24, 500, 'active'),
('Chocolate en Polvo', 'Chocolate en polvo 100% cacao', 'kg', 25, 5, 12000, 'active'),
('Sal', 'Sal de mesa refinada', 'kg', 50, 10, 1000, 'active'),
('Leche', 'Leche entera fresca', 'litros', 60, 10, 3500, 'active'),
('Vainilla', 'Extracto de vainilla puro', 'litros', 10, 2, 8500, 'active'),
('Canela', 'Canela en polvo premium', 'kg', 5, 1, 15000, 'active');

-- Si necesitas agregar más datos de ejemplo
-- Nota: Los clientes y empleados deben existir ya en la BD

-- Ejemplo de receta para Pan Francés
-- INSERT INTO product_recipes (product_id, supply_id, quantity_per_unit, unit) 
-- SELECT p.id, s.id, 0.5, 'kg'
-- FROM products p, supplies s
-- WHERE p.name = 'Pan Francés' AND s.name = 'Harina de Trigo';

-- Para ver los insumos disponibles:
-- SELECT * FROM supplies WHERE status = 'active';

-- Para ver las órdenes de producción:
-- SELECT po.*, p.name as product_name, e.first_name, e.last_name
-- FROM production_orders po
-- LEFT JOIN products p ON po.product_id = p.id
-- LEFT JOIN employees e ON po.responsible_employee_id = e.id;

-- Para ver los insumos de una orden de producción:
-- SELECT pos.*, s.name, s.stock_quantity
-- FROM production_order_supplies pos
-- LEFT JOIN supplies s ON pos.supply_id = s.id
-- WHERE pos.production_order_id = ?;
