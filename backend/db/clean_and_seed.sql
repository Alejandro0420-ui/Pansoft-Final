-- Script para limpiar y recargar la base de datos con datos de panadería
USE pansoft_db;

-- Desactivar controles de clave foránea temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas existentes
TRUNCATE TABLE sales_reports;
TRUNCATE TABLE invoices;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE supplies_inventory;
TRUNCATE TABLE supplies;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;
TRUNCATE TABLE employees;
TRUNCATE TABLE customers;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE users;

-- Reactivar controles de clave foránea
SET FOREIGN_KEY_CHECKS = 1;

-- Insertar usuarios de prueba
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@pansoft.com', '$2b$10$LQQV5cAPiUh.K7H/B7DkCONzDfGqlBnqqVniqKKK9VV9GKD/2XPYm', 'Administrador', 'admin'),
('user', 'user@pansoft.com', '$2b$10$LQQV5cAPiUh.K7H/B7DkCONzDfGqlBnqqVniqKKK9VV9GKD/2XPYm', 'Usuario Regular', 'user'),
('vendedor', 'vendedor@pansoft.com', '$2b$10$LQQV5cAPiUh.K7H/B7DkCONzDfGqlBnqqVniqKKK9VV9GKD/2XPYm', 'Vendedor', 'sales');

-- INSERTAR PRODUCTOS TERMINADOS
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level) VALUES
('Pan Francés', 'PAN-001', 'Pan francés artesanal', 'Panes', 1.50, 120, 50),
('Pan Integral', 'PAN-002', 'Pan integral saludable', 'Panes', 2.00, 45, 50),
('Croissants', 'PAS-001', 'Croissants de mantequilla', 'Pastelería', 2.50, 85, 30),
('Torta de Chocolate', 'TOR-001', 'Torta de chocolate premium', 'Tortas', 25.00, 3, 5),
('Donas Glaseadas', 'DON-001', 'Donas glaseadas variadas', 'Donas', 1.80, 67, 40),
('Galletas de Mantequilla', 'GAL-001', 'Galletas de mantequilla caseras', 'Galletas', 8.50, 28, 30),
('Muffins de Arándanos', 'MUF-001', 'Muffins de arándanos frescos', 'Muffins', 3.50, 55, 25),
('Empanadas de Pollo', 'EMP-001', 'Empanadas rellenas de pollo', 'Salados', 2.80, 90, 50);

-- INSERTAR INSUMOS (TABLA SEPARADA)
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit) VALUES
('Harina de Trigo', 'INS-001', 'Harina de trigo premium', 'Harinas', 3.50, 500, 100, 'kg'),
('Azúcar Blanca', 'INS-002', 'Azúcar blanca refinada', 'Endulzantes', 2.80, 80, 100, 'kg'),
('Levadura Seca', 'INS-003', 'Levadura seca instantánea', 'Levaduras', 12.00, 15, 20, 'kg'),
('Mantequilla', 'INS-004', 'Mantequilla premium', 'Lácteos', 8.50, 45, 30, 'kg'),
('Huevos', 'INS-005', 'Huevos frescos de granja', 'Lácteos', 0.45, 120, 50, 'docena'),
('Chocolate en Polvo', 'INS-006', 'Chocolate en polvo premium', 'Saborizantes', 15.00, 25, 20, 'kg'),
('Sal', 'INS-007', 'Sal fina', 'Condimentos', 1.20, 50, 30, 'kg');

-- Insertar proveedores
INSERT INTO suppliers (company_name, contact_person, email, phone, address, city, country, payment_terms) VALUES
('Molinos del Valle', 'Carlos Ruiz', 'carlos@molinosvalle.com', '+57 (1) 2345-6789', 'Carretera Bogotá Km 5', 'Bogotá', 'Colombia', 'Net 30'),
('Azúcar & Cía', 'María Santos', 'maria@azucarycia.com', '+57 (2) 3876-5432', 'Avda Industrial 120', 'Cali', 'Colombia', 'Net 60'),
('Insumos Panaderos', 'Juan Díaz', 'juan@insumospanaderos.com', '+57 (4) 2765-4321', 'Polígono Industrial 45', 'Medellín', 'Colombia', 'Net 45'),
('Lácteos Premium', 'Ana Moreno', 'ana@lacteospremo.com', '+57 (5) 2891-2223', 'Calle Ganadería 78', 'Barranquilla', 'Colombia', 'Net 30'),
('Granja El Porvenir', 'Pedro López', 'pedro@granjaporvenir.com', '+34-97-3333333', 'Finca Rural 23', 'Badajoz', 'Spain', 'Net 15'),
('Chocolates Finos', 'Isabel García', 'isabel@chocolatefinos.com', '+34-98-4444444', 'Calle Cacao 56', 'Toledo', 'Spain', 'Net 60'),
('Distribuidora Central', 'Roberto Silva', 'roberto@distcentral.com', '+34-99-5555555', 'Centro Logístico 33', 'Málaga', 'Spain', 'Net 45');

-- Asignar proveedores a insumos
UPDATE supplies SET supplier_id = 1 WHERE sku = 'INS-001';
UPDATE supplies SET supplier_id = 2 WHERE sku = 'INS-002';
UPDATE supplies SET supplier_id = 3 WHERE sku = 'INS-003';
UPDATE supplies SET supplier_id = 4 WHERE sku = 'INS-004';
UPDATE supplies SET supplier_id = 5 WHERE sku = 'INS-005';
UPDATE supplies SET supplier_id = 6 WHERE sku = 'INS-006';
UPDATE supplies SET supplier_id = 7 WHERE sku = 'INS-007';

-- Insertar clientes
INSERT INTO customers (name, email, phone, address, city, country, customer_type, status) VALUES
('Panadería La Mansión', 'info@lamansion.com', '+57 315 3333333', 'Calle Mayor 100', 'Madrid', 'Spain', 'B2B', 'active'),
('Supermercado El Centro', 'compras@elcentro.com', '+57 312 4444444', 'Avenida Central 250', 'Madrid', 'Spain', 'B2B', 'active'),
('Cafetería Premium', 'gerencia@cafepremo.com', '+57 311 5555555', 'Plaza del Sol 50', 'Madrid', 'Spain', 'B2B', 'active');

-- Insertar órdenes
INSERT INTO orders (order_number, customer_id, order_date, delivery_date, total_amount, status, notes) VALUES
('ORD-2024-001', 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 2999.97, 'delivered', 'Entrega completada'),
('ORD-2024-002', 2, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 849.97, 'processing', 'En preparación'),
('ORD-2024-003', 3, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 3199.95, 'pending', 'Pendiente de pago');

-- Insertar detalles de órdenes
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total) VALUES
(1, 1, 2, 1.50, 3.00),
(1, 3, 5, 2.50, 12.50),
(1, 5, 10, 1.80, 18.00),
(2, 2, 2, 2.00, 4.00),
(2, 4, 3, 25.00, 75.00),
(3, 1, 2, 1.50, 3.00),
(3, 2, 1, 2.00, 2.00),
(3, 5, 25, 1.80, 45.00);

-- Insertar facturas
INSERT INTO invoices (invoice_number, order_id, customer_id, issue_date, due_date, total_amount, paid_amount, status) VALUES
('INV-2024-001', 1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 2999.97, 2999.97, 'paid'),
('INV-2024-002', 2, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 849.97, 0.00, 'pending'),
('INV-2024-003', 3, 3, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 3199.95, 0.00, 'pending');

-- Insertar empleados
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, salary, status) VALUES
('María', 'García', 'maria@pansoft.com', '+34-91-1234567', 'Gerente de Producción', 'Production', '2023-01-15', 45000.00, 'active'),
('Juan', 'Pérez', 'juan@pansoft.com', '+34-91-7654321', 'Analista de Inventario', 'Inventory', '2023-03-20', 32000.00, 'active'),
('Carlos', 'López', 'carlos@pansoft.com', '+34-91-5555555', 'Técnico de Logística', 'Logistics', '2023-06-10', 28000.00, 'active');

-- Insertar reportes de ventas
INSERT INTO sales_reports (report_date, total_sales, total_purchases, product_category, quantity_sold) VALUES
(CURDATE(), 342.50, 0.00, 'Panes', 150),
(CURDATE(), 150.00, 0.00, 'Pastelería', 60),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 275.00, 0.00, 'Insumos', 120);

-- -- Insertar inventario de productos
-- INSERT INTO inventory (product_id, warehouse_location, quantity) VALUES
-- (1, 'Almacén A - Estante 1', 120),
-- (2, 'Almacén A - Estante 2', 45),
-- (3, 'Almacén B - Estante 1', 85),
-- (4, 'Almacén B - Estante 3', 3),
-- (5, 'Almacén C - Estante 1', 67),
-- (6, 'Almacén C - Estante 2', 28),
-- (7, 'Almacén A - Estante 3', 55),
-- (8, 'Almacén B - Estante 2', 90);

-- -- Insertar inventario de insumos
-- INSERT INTO supplies_inventory (supply_id, warehouse_location, quantity) VALUES
-- (1, 'Almacén D - Estante 1', 500),
-- (2, 'Almacén D - Estante 2', 80),
-- (3, 'Almacén E - Estante 1', 15),
-- (4, 'Almacén E - Estante 2', 45),
-- (5, 'Almacén E - Estante 3', 120),
-- (6, 'Almacén F - Estante 1', 25),
-- (7, 'Almacén F - Estante 2', 50);
