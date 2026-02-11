-- Insertar usuario de prueba
INSERT INTO users (username, email, password, full_name, role) VALUES 
('admin', 'admin@pansoft.com', 'password123', 'Administrador', 'admin'),
('user', 'user@pansoft.com', 'password123', 'Usuario Test', 'user');

-- Insertar datos de ejemplo de productos
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level) VALUES
('Pan Blanco', 'PB001', 'Pan blanco integral premium', 'Panes', 3.50, 50, 10),
('Pan Integral', 'PI001', 'Pan integral de trigo', 'Panes', 4.00, 30, 10),
('Croissant', 'CR001', 'Croissant francés', 'Pastelería', 2.50, 25, 8),
('Torta de Chocolate', 'TC001', 'Torta de chocolate oscuro', 'Tortas', 15.00, 10, 3),
('Galletas de Avena', 'GA001', 'Galletas integrales de avena', 'Galletas', 1.50, 100, 20);

-- Insertar datos de clientes
INSERT INTO customers (name, email, phone, address, city, country, customer_type, status) VALUES
('Juan García', 'juan@email.com', '+1234567890', 'Calle Principal 123', 'Madrid', 'España', 'retail', 'active'),
('María López', 'maria@email.com', '+1234567891', 'Avenida Central 456', 'Barcelona', 'España', 'wholesale', 'active'),
('Carlos Rodríguez', 'carlos@email.com', '+1234567892', 'Calle Secundaria 789', 'Valencia', 'España', 'retail', 'active');

-- Insertar proveedores
INSERT INTO suppliers (company_name, contact_person, email, phone, address, city, country, payment_terms) VALUES
('Molino Central', 'José Martínez', 'jose@molino.com', '+1234567800', 'Carretera 100', 'Castilla', 'España', 'Net 30'),
('Huevos Premium', 'Ana García', 'ana@huevos.com', '+1234567801', 'Granja 200', 'Aragón', 'España', 'Net 15'),
('Azúcar Puro', 'Roberto López', 'roberto@azucar.com', '+1234567802', 'Finca 300', 'Andalucía', 'España', 'Net 45');

-- Insertar empleados
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, salary, status) VALUES
('Pedro', 'González', 'pedro@pansoft.com', '+1234567900', 'Panadero', 'Producción', '2023-01-15', 2000.00, 'active'),
('Sofia', 'Martínez', 'sofia@pansoft.com', '+1234567901', 'Vendedora', 'Ventas', '2023-03-20', 1800.00, 'active'),
('Miguel', 'Fernández', 'miguel@pansoft.com', '+1234567902', 'Gerente', 'Administración', '2023-01-01', 3000.00, 'active');

-- Insertar órdenes de ejemplo
INSERT INTO orders (order_number, customer_id, delivery_date, total_amount, status) VALUES
('ORD001', 1, '2026-02-10', 150.00, 'pending'),
('ORD002', 2, '2026-02-12', 450.00, 'completed'),
('ORD003', 3, '2026-02-15', 300.00, 'processing');

-- Insertar inventario
INSERT INTO inventory (product_id, warehouse_location, quantity) VALUES
(1, 'Pasillo A - Estante 1', 50),
(2, 'Pasillo A - Estante 2', 30),
(3, 'Pasillo B - Estante 1', 25),
(4, 'Pasillo C - Estante 1', 10),
(5, 'Pasillo C - Estante 2', 100);
