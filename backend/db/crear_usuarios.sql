-- Script para crear usuarios de prueba en Pansoft
-- Ejecuta esto en psql o en pgAdmin

INSERT INTO users (username, email, password, full_name, role) 
VALUES 
  ('admin', 'admin@pansoft.com', 'password123', 'Administrador', 'admin'),
  ('user', 'user@pansoft.com', 'password123', 'Usuario Test', 'user'),
  ('vendedor', 'vendedor@pansoft.com', 'password123', 'Juan Vendedor', 'user');

-- Insertar productos de prueba
INSERT INTO products (name, sku, description, category, price, stock_quantity, min_stock_level) 
VALUES
  ('Pan Blanco', 'PB001', 'Pan blanco integral premium', 'Panes', 6500.00, 50, 10),
  ('Pan Integral', 'PI001', 'Pan integral de trigo', 'Panes', 7500.00, 30, 10),
  ('Croissant', 'CR001', 'Croissant francés', 'Pastelería', 5500.00, 25, 8),
  ('Torta de Chocolate', 'TC001', 'Torta de chocolate oscuro', 'Tortas', 65000.00, 10, 3),
  ('Galletas de Avena', 'GA001', 'Galletas integrales de avena', 'Galletas', 4500.00, 100, 20);

-- Insertar clientes
INSERT INTO customers (name, email, phone, address, city, country, customer_type, status) 
VALUES
  ('Juan García', 'juan@email.com', '+57 (1) 2345-6789', 'Calle Principal 123', 'Bogotá', 'Colombia', 'retail', 'active'),
  ('María López', 'maria@email.com', '+57 (2) 3456-7890', 'Avenida Central 456', 'Cali', 'Colombia', 'wholesale', 'active'),
  ('Carlos Rodríguez', 'carlos@email.com', '+57 312 456 7890', 'Calle Secundaria 789', 'Medellín', 'Colombia', 'retail', 'active');

-- Insertar proveedores
INSERT INTO suppliers (company_name, contact_person, email, phone, address, city, country, payment_terms) 
VALUES
  ('Molino Central', 'José Martínez', 'jose@molino.com', '+57 (1) 2567-8901', 'Carretera 100', 'Bogotá', 'Colombia', 'Net 30'),
  ('Huevos Premium', 'Ana García', 'ana@huevos.com', '+57 300 234 5678', 'Granja 200', 'Cundinamarca', 'Colombia', 'Net 15'),
  ('Azúcar Puro', 'Roberto López', 'roberto@azucar.com', '+57 (2) 3456-7890', 'Finca 300', 'Cali', 'Colombia', 'Net 45');

-- Insertar empleados
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, salary, status) 
VALUES
  ('Pedro', 'González', 'pedro@pansoft.com', '+57 (1) 2789-0123', 'Panadero', 'Producción', '2023-01-15', 2000.00, 'active'),
  ('Sofia', 'Martínez', 'sofia@pansoft.com', '+57 300 345 6789', 'Vendedora', 'Ventas', '2023-03-20', 1800.00, 'active'),
  ('Miguel', 'Fernández', 'miguel@pansoft.com', '+57 (2) 3456-7891', 'Gerente', 'Administración', '2023-01-01', 3000.00, 'active');

-- Verificar que se crearon los usuarios
SELECT COUNT(*) as total_usuarios FROM users;
SELECT COUNT(*) as total_productos FROM products;
SELECT COUNT(*) as total_clientes FROM customers;
SELECT COUNT(*) as total_empleados FROM employees;
