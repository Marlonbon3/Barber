-- Agregar columna status a la tabla profiles
-- Ejecutar este script en Supabase SQL Editor

-- 1. Agregar la columna status con valor por defecto 'active'
ALTER TABLE profiles 
ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- 2. Actualizar todos los registros existentes para tener status 'active'
UPDATE profiles 
SET status = 'active' 
WHERE status IS NULL;

-- 3. Agregar comentario a la columna
COMMENT ON COLUMN profiles.status IS 'Estado del barbero: active (disponible) o inactive (no disponible/día libre)';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'status';