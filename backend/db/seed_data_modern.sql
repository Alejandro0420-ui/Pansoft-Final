-- Script para popular la base de datos con datos de prueba modernos
USE pansoft_db;

-- Desactivar controles de clave foránea temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas existentes (sin truncar tabla completa para preservar estructura)
DELETE FROM sales_order_insumos;
DELETE FROM sales_order_items;
DELETE FROM sales_orders;
DELETE FROM production_order_insumos;
DELETE FROM production_orders;
DELETE FROM inventory;
DELETE FROM employees;
DELETE FROM customers;
DELETE FROM products;
DELETE FROM supplies;

-- Reactivar controles de clave foránea
SET FOREIGN_KEY_CHECKS = 1;


-- INSERTAR PRODUCTOS
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Pan Francés', 'PAN-001', 'Pan francés artesanal crujiente', 'Panes', 2.50, 150, 50, TRUE);
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Pan Integral', 'PAN-002', 'Pan integral saludable', 'Panes', 3.00, 80, 40, TRUE);
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Croissants', 'PAS-001', 'Croissants de mantequilla fresca', 'Pastelería', 3.50, 120, 30, TRUE);
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Torta de Chocolate', 'TOR-001', 'Torta de chocolate premium', 'Tortas', 28.00, 8, 5, TRUE);
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Donas Glaseadas', 'DON-001', 'Donas glaseadas variadas', 'Donas', 2.00, 100, 40, TRUE);
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Galletas de Mantequilla', 'GAL-001', 'Galletas de mantequilla caseras', 'Galletas', 10.00, 45, 30, TRUE);
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Muffins de Arándanos', 'MUF-001', 'Muffins de arándanos frescos', 'Muffins', 4.00, 75, 25, TRUE);
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Empanadas de Pollo', 'EMP-001', 'Empanadas rellenas de pollo', 'Salados', 3.50, 120, 50, TRUE);
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Brownie de Chocolate', 'BRO-001', 'Brownie casero de chocolate', 'Postres', 4.50, 60, 20, TRUE);
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, is_active) VALUES ('Pan de Queso', 'PAQ-001', 'Pan de queso artesanal', 'Panes', 15.00, 25, 15, TRUE);

-- INSERTAR CLIENTES
INSERT INTO customers (name, email, phone, address, city, country, customer_type) VALUES ('Panadería La Mansión', 'info@lamansion.com', '+34-91-3333333', 'Calle Mayor 100', 'Madrid', 'Spain', 'B2B');
INSERT INTO customers (name, email, phone, address, city, country, customer_type) VALUES ('Supermercado El Centro', 'compras@elcentro.com', '+34-91-4444444', 'Avenida Central 250', 'Madrid', 'Spain', 'B2B');
INSERT INTO customers (name, email, phone, address, city, country, customer_type) VALUES ('Cafetería Premium', 'gerencia@cafepremo.com', '+34-91-5555555', 'Plaza del Sol 50', 'Madrid', 'Spain', 'B2B');
INSERT INTO customers (name, email, phone, address, city, country, customer_type) VALUES ('Restaurante Casa Luis', 'pedidos@casaluis.com', '+34-91-6666666', 'Calle Goya 75', 'Madrid', 'Spain', 'B2B');
INSERT INTO customers (name, email, phone, address, city, country, customer_type) VALUES ('Tienda Gourmet', 'ventas@tiendagourmet.com', '+34-91-7777777', 'Paseo Recoletos 42', 'Madrid', 'Spain', 'B2B');

-- INSERTAR EMPLEADOS
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, status) VALUES ('Juan', 'Rodríguez', 'juan@pansoft.com', '+34-91-1111111', 'Panadero', 'Producción', '2023-01-15', 'active');
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, status) VALUES ('María', 'García', 'maria@pansoft.com', '+34-91-2222222', 'Panadero', 'Producción', '2023-02-20', 'active');
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, status) VALUES ('Carlos', 'López', 'carlos@pansoft.com', '+34-91-3333333', 'Pastelero', 'Producción', '2023-03-10', 'active');
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, status) VALUES ('Ana', 'Martínez', 'ana@pansoft.com', '+34-91-4444444', 'Vendedor', 'Ventas', '2023-04-05', 'active');
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, status) VALUES ('Pedro', 'Sánchez', 'pedro@pansoft.com', '+34-91-5555555', 'Gerente', 'Administración', '2022-06-01', 'active');
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, status) VALUES ('Sofia', 'Moreno', 'sofia@pansoft.com', '+34-91-6666666', 'Contador', 'Finanzas', '2023-05-15', 'active');

-- INSERTAR ÓRDENES DE VENTA
INSERT INTO sales_orders (order_number, customer_id, customer_name, order_date, delivery_date, total_amount, status, notes) VALUES
('SO-2024-0001', 1, 'Panadería La Mansión', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 185.50, 'completada', 'Entrega en progreso');

INSERT INTO sales_orders (order_number, customer_id, customer_name, order_date, delivery_date, total_amount, status, notes) VALUES
('SO-2024-0002', 2, 'Supermercado El Centro', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), 425.75, 'pendiente', 'Esperando confirmación');

INSERT INTO sales_orders (order_number, customer_id, customer_name, order_date, delivery_date, total_amount, status, notes) VALUES
('SO-2024-0003', 3, 'Cafetería Premium', NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 312.50, 'pendiente', 'Nueva orden');

INSERT INTO sales_orders (order_number, customer_id, customer_name, order_date, delivery_date, total_amount, status, notes) VALUES
('SO-2024-0004', 4, 'Restaurante Casa Luis', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 95.00, 'completada', 'Entregada');

INSERT INTO sales_orders (order_number, customer_id, customer_name, order_date, delivery_date, total_amount, status, notes) VALUES
('SO-2024-0005', 5, 'Tienda Gourmet', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 750.25, 'pendiente', 'Aceptada');

-- INSERTAR ITEMS DE ÓRDENES DE VENTA
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
(1, 1, 20, 2.50, 50.00),
(1, 3, 15, 3.50, 52.50),
(1, 5, 30, 1.80, 54.00);

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
(2, 2, 10, 3.00, 30.00),
(2, 4, 5, 28.00, 140.00),
(2, 6, 25, 10.00, 250.00);

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
(3, 1, 15, 2.50, 37.50),
(3, 7, 20, 4.00, 80.00),
(3, 8, 25, 3.50, 87.50);

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
(4, 9, 10, 4.50, 45.00),
(4, 5, 20, 2.00, 40.00);

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, total) VALUES
(5, 1, 50, 2.50, 125.00),
(5, 2, 30, 3.00, 90.00),
(5, 3, 40, 3.50, 140.00),
(5, 10, 5, 15.00, 75.00),
(5, 4, 3, 28.00, 84.00);

-- INSERTAR ÓRDENES DE PRODUCCIÓN
INSERT INTO production_orders (order_number, product_id, quantity, responsible_employee_id, order_date, due_date, status, notes) VALUES
('PO-2024-0001', 1, 100, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 'completada', 'Pan Francés producido'),
('PO-2024-0002', 3, 80, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 'completada', 'Croissants listos'),
('PO-2024-0003', 4, 10, 3, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 'pendiente', 'Torta de Chocolate en proceso'),
('PO-2024-0004', 2, 50, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), 'pendiente', 'Pan Integral programado'),
('PO-2024-0005', 7, 60, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), 'completada', 'Muffins finalizados'),
('PO-2024-0006', 6, 30, 3, NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY), 'pendiente', 'Galletas en fase de mezcla');

-- INSERTAR INSUMOS
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Harina de Trigo', 'SUP-001', 'Harina de trigo premium', 'Harinas', 4.50, 500, 100, 'kg');
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Azúcar Blanca', 'SUP-002', 'Azúcar blanca refinada', 'Endulzantes', 3.20, 200, 80, 'kg');
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Levadura Seca', 'SUP-003', 'Levadura seca instantánea', 'Levaduras', 18.00, 30, 15, 'kg');
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Mantequilla', 'SUP-004', 'Mantequilla de calidad premium', 'Lácteos', 12.00, 80, 30, 'kg');
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Huevos Frescos', 'SUP-005', 'Huevos frescos de granja', 'Lácteos', 0.60, 500, 150, 'docena');
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Chocolate en Polvo', 'SUP-006', 'Chocolate en polvo premium', 'Saborizantes', 22.00, 40, 15, 'kg');
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Sal Fina', 'SUP-007', 'Sal fina para panadería', 'Condimentos', 1.80, 100, 40, 'kg');
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Vainilla Pura', 'SUP-008', 'Extracto de vainilla pura', 'Saborizantes', 35.00, 15, 5, 'l');
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Arándanos Secos', 'SUP-009', 'Arándanos deshidratados', 'Frutas', 45.00, 20, 8, 'kg');
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES ('Aceite de Oliva', 'SUP-010', 'Aceite de oliva virgen extra', 'Aceites', 28.00, 30, 10, 'l');
