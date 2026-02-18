-- Migración: Normalizar números de orden de SO- a VNT-
-- Este script convierte todos los números que empiezan con SO- a VNT-

-- Primero, hacer un backup visualizando qué se va a cambiar
SELECT order_number, COUNT(*) as cantidad
FROM sales_orders
WHERE order_number LIKE 'SO-%'
GROUP BY order_number;

-- EJECUTAR ESTA ACTUALIZACIÓN SOLO SI LA CONSULTA ANTERIOR MUESTRA RESULTADOS
-- UPDATE sales_orders 
-- SET order_number = CONCAT('VNT-', SUBSTRING(order_number, 4))
-- WHERE order_number LIKE 'SO-%';

-- Verificar que se actualizó correctamente
-- SELECT DISTINCT order_number FROM sales_orders ORDER BY order_number DESC LIMIT 5;
