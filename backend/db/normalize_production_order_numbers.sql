-- ============================================================================
-- Script: Normalizar números de órdenes de producción
-- ============================================================================
-- Convierte números de orden del formato antiguo (prod-1, prod-11, etc.)
-- al nuevo formato (PROD-001, PROD-002, etc.)
-- ============================================================================

-- 1. Mostrar órdenes actuales antes de cambiar
SELECT id, order_number FROM production_orders ORDER BY id;

-- 2. Crear tabla temporal para mapeo de números antiguos a nuevos
CREATE TEMPORARY TABLE temp_order_mapping (
  old_id INT,
  old_number VARCHAR(50),
  new_number VARCHAR(50)
);

-- 3. Generar mapeo: para cada orden existente, asignar nuevo número secuencial
INSERT INTO temp_order_mapping (old_id, old_number, new_number)
SELECT 
  id,
  order_number,
  CONCAT('PROD-', LPAD(ROW_NUMBER() OVER (ORDER BY id), 3, '0'))
FROM production_orders
ORDER BY id;

-- 4. Mostrar mapeo a realizar
SELECT old_number, new_number FROM temp_order_mapping;

-- 5. Actualizar production_orders con los nuevos números
UPDATE production_orders po
INNER JOIN temp_order_mapping tm ON po.id = tm.old_id
SET po.order_number = tm.new_number;

-- 6. Verificar resultado
SELECT id, order_number FROM production_orders ORDER BY id;

-- 7. Mostrar resumen
SELECT 
  COUNT(*) as total_orders,
  COUNT(DISTINCT order_number) as unique_numbers,
  MIN(order_number) as first_order,
  MAX(order_number) as last_order
FROM production_orders;

-- 8. Confirmar que todos los números siguen el patrón PROD-XXX
SELECT COUNT(*) as non_conforming FROM production_orders 
WHERE order_number NOT REGEXP '^PROD-[0-9]{3}$';

-- Si el resultado anterior es 0, está correcto. Si es > 0, algo va mal.
-- En ese caso, ver cuáles no conforman:
SELECT * FROM production_orders 
WHERE order_number NOT REGEXP '^PROD-[0-9]{3}$';
