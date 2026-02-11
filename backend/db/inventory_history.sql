-- Tabla de historial de movimientos de inventario
CREATE TABLE IF NOT EXISTS inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución') NOT NULL,
  quantity_change INT NOT NULL,
  previous_quantity INT,
  new_quantity INT,
  reason VARCHAR(255),
  notes LONGTEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product_date (product_id, created_at),
  INDEX idx_movement_type (movement_type),
  INDEX idx_created_at (created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de historial de movimientos de insumos
CREATE TABLE IF NOT EXISTS supplies_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supply_id INT NOT NULL,
  movement_type ENUM('entrada', 'salida', 'ajuste', 'devolución') NOT NULL,
  quantity_change INT NOT NULL,
  previous_quantity INT,
  new_quantity INT,
  reason VARCHAR(255),
  notes LONGTEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_supply_date (supply_id, created_at),
  INDEX idx_movement_type (movement_type),
  INDEX idx_created_at (created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
