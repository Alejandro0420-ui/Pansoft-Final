-- Agregar campo category a la tabla suppliers si no existe
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Sin categoría';
