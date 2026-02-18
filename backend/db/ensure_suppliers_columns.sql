-- Script para verificar y agregar columna is_active a suppliers si no existe

BEGIN;

-- Verificar si la columna existe  
SELECT COLUMN_NAME INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'suppliers' 
AND COLUMN_NAME = 'is_active' 
AND TABLE_SCHEMA = DATABASE();

-- Si no existe, agregarla
SET @alter_query = IF(
  @col_exists IS NULL,
  'ALTER TABLE suppliers ADD COLUMN is_active BOOLEAN DEFAULT TRUE',
  'SELECT "Columna is_active ya existe"'
);

SET @sql = @alter_query;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar si la columna category existe
SELECT COLUMN_NAME INTO @cat_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'suppliers' 
AND COLUMN_NAME = 'category' 
AND TABLE_SCHEMA = DATABASE();

-- Si no existe, agregarla
SET @alter_query = IF(
  @cat_exists IS NULL,
  'ALTER TABLE suppliers ADD COLUMN category VARCHAR(100)',
  'SELECT "Columna category ya existe"'
);

SET @sql = @alter_query;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar registros NULL a activos
UPDATE suppliers SET is_active = TRUE WHERE is_active IS NULL;

COMMIT;
