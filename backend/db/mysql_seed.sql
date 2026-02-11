-- Datos de prueba para Pansoft (MySQL)
-- Ejecuta este script DESPUÉS de mysql_init.sql

USE pansoft_db;

-- Insertar usuarios de prueba
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@pansoft.com', '$2b$10$LQQV5cAPiUh.K7H/B7DkCONzDfGqlBnqqVniqKKK9VV9GKD/2XPYm', 'Administrador', 'admin'),
('user', 'user@pansoft.com', '$2b$10$LQQV5cAPiUh.K7H/B7DkCONzDfGqlBnqqVniqKKK9VV9GKD/2XPYm', 'Usuario Regular', 'user'),
('vendedor', 'vendedor@pansoft.com', '$2b$10$LQQV5cAPiUh.K7H/B7DkCONzDfGqlBnqqVniqKKK9VV9GKD/2XPYm', 'Vendedor', 'sales');

-- Insertar productos de panadería - Productos Terminados
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level, image_url) VALUES
('Pan Francés', 'PAN-001', 'Pan francés artesanal', 'Panes', 1.50, 120, 50, '/images/products/pan-frances.jpg'),
('Pan Integral', 'PAN-002', 'Pan integral saludable', 'Panes', 2.00, 45, 50, '/images/products/pan-integral.jpg'),
('Croissants', 'PAS-001', 'Croissants de mantequilla', 'Pastelería', 2.50, 85, 30, '/images/products/croissants.jpg'),
('Torta de Chocolate', 'TOR-001', 'Torta de chocolate premium', 'Tortas', 25.00, 3, 5, '/images/products/torta-chocolate.jpg'),
('Donas Glaseadas', 'DON-001', 'Donas glaseadas variadas', 'Donas', 1.80, 67, 40, '/images/products/donas.jpg'),
('Galletas de Mantequilla', 'GAL-001', 'Galletas de mantequilla caseras', 'Galletas', 8.50, 28, 30, '/images/products/galletas-mantequilla.jpg'),
('Muffins de Arándanos', 'MUF-001', 'Muffins de arándanos frescos', 'Muffins', 3.50, 55, 25, '/images/products/muffins-arandanos.jpg'),
('Empanadas de Pollo', 'EMP-001', 'Empanadas rellenas de pollo', 'Salados', 2.80, 90, 50, '/images/products/empanadas-pollo.jpg'),
('Pan Blanco', 'PB001', 'Pan blanco integral premium', 'Panes', 3.50, 50, 10, '/images/products/pan-blanco.jpg'),
('Croissant de Jamón', 'CR002', 'Croissant francés relleno de jamón', 'Salados', 3.50, 40, 20, '/images/products/croissant-jamon.jpg'),
('Bizcocho de Limón', 'BIZ-001', 'Bizcocho esponjoso de limón', 'Postres', 12.00, 15, 5, '/images/products/bizcocho-limon.jpg'),
('Tarta de Fresas', 'TAR-001', 'Tarta con fresas frescas', 'Postres', 18.00, 8, 3, '/images/products/tarta-fresas.jpg');

-- Insertar insumos (materias primas)
INSERT INTO supplies (name, sku, description, category, price, stock_quantity, min_stock_level, unit, image_url) VALUES
('Harina de Trigo', 'INS-001', 'Harina de trigo premium', 'Harinas', 3.50, 500, 100, 'kg', '/images/supplies/harina-trigo.jpg'),
('Azúcar Blanca', 'INS-002', 'Azúcar blanca refinada', 'Endulzantes', 2.80, 80, 100, 'kg', '/images/supplies/azucar-blanca.jpg'),
('Levadura Seca', 'INS-003', 'Levadura seca instantánea', 'Levaduras', 12.00, 15, 20, 'g', '/images/supplies/levadura-seca.jpg'),
('Mantequilla', 'INS-004', 'Mantequilla premium', 'Lácteos', 8.50, 45, 30, 'kg', '/images/supplies/mantequilla.jpg'),
('Huevos', 'INS-005', 'Huevos frescos de granja', 'Lácteos', 0.45, 120, 50, 'docena', '/images/supplies/huevos.jpg'),
('Chocolate en Polvo', 'INS-006', 'Chocolate en polvo premium', 'Saborizantes', 15.00, 25, 20, 'kg', '/images/supplies/chocolate-polvo.jpg'),
('Sal', 'INS-007', 'Sal fina', 'Condimentos', 1.20, 50, 30, 'kg', '/images/supplies/sal.jpg'),
('Leche Entera', 'INS-008', 'Leche entera fresca', 'Lácteos', 1.50, 200, 50, 'litro', '/images/supplies/leche.jpg'),
('Esencia de Vainilla', 'INS-009', 'Esencia de vainilla pura', 'Saborizantes', 8.00, 10, 5, 'ml', '/images/supplies/vainilla.jpg'),
('Polvo de Hornear', 'INS-010', 'Polvo de hornear químico', 'Levaduras', 5.00, 30, 15, 'kg', '/images/supplies/polvo-hornear.jpg');

-- Insertar proveedores
INSERT INTO suppliers (company_name, contact_person, email, phone, address, city, country, payment_terms) VALUES
('Molinos del Valle', 'Carlos Ruiz', 'carlos@molinosvalle.com', '+57 (1) 2345-6789', 'Carretera Bogotá Km 5', 'Bogotá', 'Colombia', 'Net 30'),
('Azúcar & Cía', 'María Santos', 'maria@azucarycia.com', '+57 (2) 3876-5432', 'Avda Industrial 120', 'Cali', 'Colombia', 'Net 60'),
('Insumos Panaderos', 'Juan Díaz', 'juan@insumospanaderos.com', '+57 (4) 2765-4321', 'Polígono Industrial 45', 'Medellín', 'Colombia', 'Net 45'),
('Lácteos Premium', 'Ana Moreno', 'ana@lacteospremo.com', '+57 (5) 2891-2223', 'Calle Ganadería 78', 'Barranquilla', 'Colombia', 'Net 30'),
('Granja El Porvenir', 'Pedro López', 'pedro@granjaporvenir.com', '+57 300 123 4567', 'Finca Rural 23', 'Villavicencio', 'Colombia', 'Net 15'),
('Chocolates Finos', 'Isabel García', 'isabel@chocolatefinos.com', '+57 302 456 7890', 'Calle Cacao 56', 'Santa Marta', 'Colombia', 'Net 60'),
('Distribuidora Central', 'Roberto Silva', 'roberto@distcentral.com', '+57 304 789 0123', 'Centro Logístico 33', 'Cartagena', 'Colombia', 'Net 45');

-- Insertar clientes
INSERT INTO customers (name, email, phone, address, city, country, customer_type, status) VALUES
('Panadería La Mansión', 'info@lamansion.com', '+57 (1) 2898-7654', 'Calle Mayor 100', 'Bogotá', 'Colombia', 'B2B', 'active'),
('Supermercado El Centro', 'compras@elcentro.com', '+34-91-4444444', 'Avenida Central 250', 'Madrid', 'Spain', 'B2B', 'active'),
('Cafetería Premium', 'gerencia@cafepremo.com', '+34-91-5555555', 'Plaza del Sol 50', 'Madrid', 'Spain', 'B2B', 'active');

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

-- Insertar inventario
INSERT INTO inventory (product_id, warehouse_location, quantity) VALUES
(1, 'Almacén A - Estante 1', 120),
(2, 'Almacén A - Estante 2', 45),
(3, 'Almacén B - Estante 1', 85),
(4, 'Almacén B - Estante 3', 3),
(5, 'Almacén C - Estante 1', 67),
(6, 'Almacén C - Estante 2', 28),
(7, 'Almacén A - Estante 3', 55),
(8, 'Almacén B - Estante 2', 90),
(9, 'Almacén A - Estante 4', 50),
(10, 'Almacén B - Estante 4', 40),
(11, 'Almacén C - Estante 3', 15),
(12, 'Almacén C - Estante 4', 8);

-- Insertar inventario de supplies
INSERT INTO supplies_inventory (supply_id, warehouse_location, quantity) VALUES
(1, 'Almacén D - Estante 1', 500),
(2, 'Almacén D - Estante 2', 80),
(3, 'Almacén E - Estante 1', 15),
(4, 'Almacén E - Estante 2', 45),
(5, 'Almacén E - Estante 3', 120),
(6, 'Almacén F - Estante 1', 25),
(7, 'Almacén F - Estante 2', 50),
(8, 'Almacén F - Estante 3', 200),
(9, 'Almacén F - Estante 4', 10),
(10, 'Almacén F - Estante 5', 30);
