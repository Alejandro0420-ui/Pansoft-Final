-- Add is_active column to suppliers table (ignorar si ya existe)
-- Este archivo solo se ejecuta si la columna no existe
ALTER TABLE suppliers ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Add category column to suppliers table (ignorar si ya existe)
ALTER TABLE suppliers ADD COLUMN category VARCHAR(100);

-- Update existing records to be active
UPDATE suppliers SET is_active = TRUE WHERE is_active IS NULL OR is_active = 0;



