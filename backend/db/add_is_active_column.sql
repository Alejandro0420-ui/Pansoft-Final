-- Add is_active column to products table
ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to supplies table
ALTER TABLE supplies ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Verify the columns were added
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'is_active';

SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'supplies' AND COLUMN_NAME = 'is_active';
