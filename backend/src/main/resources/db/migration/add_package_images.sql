-- Add package images functionality
-- Run this to add image support to packages

-- Create package_images table for storing package images (up to 3 per package)
CREATE TABLE IF NOT EXISTS package_images (
    package_id BIGINT,
    image_url VARCHAR(500),
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_package_images_package_id ON package_images(package_id);
