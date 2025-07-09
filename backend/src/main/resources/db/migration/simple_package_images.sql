-- Simple migration to add package images support
-- Execute this in your MySQL database

-- Add the package_images table
CREATE TABLE IF NOT EXISTS package_images (
    package_id BIGINT NOT NULL,
    image_url VARCHAR(500),
    INDEX idx_package_images_package_id (package_id),
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Verify the packages table has all required columns
DESCRIBE packages;
