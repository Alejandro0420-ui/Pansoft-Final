-- Agregar columna image_url a las tablas products y supplies

USE pansoft_db;

ALTER TABLE products ADD COLUMN image_url VARCHAR(255) AFTER description;
ALTER TABLE supplies ADD COLUMN image_url VARCHAR(255) AFTER description;
