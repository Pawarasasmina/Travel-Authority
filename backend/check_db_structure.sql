-- Database structure check for packages table
SHOW TABLES LIKE 'packages';
DESCRIBE packages;
SHOW TABLES LIKE 'package_features';
DESCRIBE package_features;

-- Check if the pricing columns exist
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'packages' 
AND TABLE_SCHEMA = 'travelauthoritydb';
