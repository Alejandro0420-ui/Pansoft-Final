-- Tabla de insumos/supplies (materias primas para producción)
CREATE TABLE IF NOT EXISTS insumos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  unit VARCHAR(50) DEFAULT 'kg',
  stock_quantity DECIMAL(10, 2) DEFAULT 0,
  min_stock_level DECIMAL(10, 2) DEFAULT 10,
  unit_price DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de órdenes de producción
CREATE TABLE IF NOT EXISTS production_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  responsible_employee_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (responsible_employee_id) REFERENCES employees(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de insumos necesarios en órdenes de producción
CREATE TABLE IF NOT EXISTS production_order_insumos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  production_order_id BIGINT UNSIGNED NOT NULL,
  insumo_id INT NOT NULL,
  quantity_required DECIMAL(10, 2),
  quantity_used DECIMAL(10, 2) DEFAULT 0,
  unit VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (insumo_id) REFERENCES insumos(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de recetas (insumos necesarios por producto)
CREATE TABLE IF NOT EXISTS product_recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  insumo_id INT NOT NULL,
  quantity_per_unit DECIMAL(10, 2),
  unit VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, insumo_id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (insumo_id) REFERENCES insumos(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de ventas (órdenes de venta)
CREATE TABLE IF NOT EXISTS sales_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_date DATE,
  total_amount DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de detalles de ventas
CREATE TABLE IF NOT EXISTS sales_order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sales_order_id BIGINT UNSIGNED NOT NULL,
  product_id INT NOT NULL,
  quantity INT,
  unit_price DECIMAL(10, 2),
  total DECIMAL(10, 2),
  FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de insumos personalizados en órdenes de venta
CREATE TABLE IF NOT EXISTS sales_order_insumos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sales_order_id BIGINT UNSIGNED NOT NULL,
  insumo_id INT NOT NULL,
  quantity_required DECIMAL(10, 2),
  unit VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (insumo_id) REFERENCES insumos(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Índices para optimización
CREATE INDEX idx_production_orders_product ON production_orders(product_id);
CREATE INDEX idx_production_orders_status ON production_orders(status);
CREATE INDEX idx_production_orders_responsible ON production_orders(responsible_employee_id);
CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_insumos_stock ON insumos(stock_quantity);
