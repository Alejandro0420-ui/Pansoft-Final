-- Agregar soporte para clientes manuales en órdenes de venta
ALTER TABLE sales_orders 
MODIFY customer_id INT NULL,
DROP FOREIGN KEY sales_orders_ibfk_1,
ADD customer_name VARCHAR(100),
ADD CONSTRAINT sales_orders_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Agregar índices para las nuevas búsquedas
CREATE INDEX idx_sales_orders_customer_name ON sales_orders(customer_name);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
