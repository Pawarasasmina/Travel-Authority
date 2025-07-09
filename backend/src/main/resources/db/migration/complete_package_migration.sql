-- Combined migration for package functionality
-- This handles both existing packages and new image functionality

-- First ensure packages table exists with all required columns
CREATE TABLE IF NOT EXISTS packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    foreign_adult_price DOUBLE,
    foreign_kid_price DOUBLE,
    local_adult_price DOUBLE,
    local_kid_price DOUBLE,
    activity_id INT,
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE
);

-- Add missing pricing columns if they don't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'packages' 
     AND column_name = 'foreign_adult_price' 
     AND table_schema = DATABASE()) > 0,
    'SELECT 1',
    'ALTER TABLE packages ADD COLUMN foreign_adult_price DOUBLE'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'packages' 
     AND column_name = 'foreign_kid_price' 
     AND table_schema = DATABASE()) > 0,
    'SELECT 1',
    'ALTER TABLE packages ADD COLUMN foreign_kid_price DOUBLE'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'packages' 
     AND column_name = 'local_adult_price' 
     AND table_schema = DATABASE()) > 0,
    'SELECT 1',
    'ALTER TABLE packages ADD COLUMN local_adult_price DOUBLE'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'packages' 
     AND column_name = 'local_kid_price' 
     AND table_schema = DATABASE()) > 0,
    'SELECT 1',
    'ALTER TABLE packages ADD COLUMN local_kid_price DOUBLE'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create package_features table if it doesn't exist
CREATE TABLE IF NOT EXISTS package_features (
    package_id BIGINT,
    feature VARCHAR(500),
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Create package_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS package_images (
    package_id BIGINT,
    image_url VARCHAR(500),
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_package_features_package_id ON package_features(package_id);
CREATE INDEX IF NOT EXISTS idx_package_images_package_id ON package_images(package_id);

-- Update existing packages to have default pricing if they exist and pricing is null
UPDATE packages 
SET foreign_adult_price = COALESCE(foreign_adult_price, price * 1.3),
    foreign_kid_price = COALESCE(foreign_kid_price, price * 0.9),
    local_adult_price = COALESCE(local_adult_price, price),
    local_kid_price = COALESCE(local_kid_price, price * 0.7)
WHERE foreign_adult_price IS NULL OR foreign_kid_price IS NULL 
   OR local_adult_price IS NULL OR local_kid_price IS NULL;
