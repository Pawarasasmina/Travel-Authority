-- MySQL script to add availability column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS availability INT DEFAULT 10 NOT NULL;

-- For existing packages, set availability to a default value
UPDATE packages SET availability = 10 WHERE 1=1;

-- This is the query to run to check if the migration has been applied
-- SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'packages' AND COLUMN_NAME = 'availability';
