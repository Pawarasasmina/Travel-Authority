-- Add pricing tiers to packages table
-- Run this after the initial packages table creation

ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS foreign_adult_price DOUBLE,
ADD COLUMN IF NOT EXISTS foreign_kid_price DOUBLE,
ADD COLUMN IF NOT EXISTS local_adult_price DOUBLE,
ADD COLUMN IF NOT EXISTS local_kid_price DOUBLE;

-- Update existing packages to have default pricing if they exist
UPDATE packages 
SET foreign_adult_price = COALESCE(foreign_adult_price, price * 1.3),
    foreign_kid_price = COALESCE(foreign_kid_price, price * 0.9),
    local_adult_price = COALESCE(local_adult_price, price),
    local_kid_price = COALESCE(local_kid_price, price * 0.7)
WHERE foreign_adult_price IS NULL OR foreign_kid_price IS NULL 
   OR local_adult_price IS NULL OR local_kid_price IS NULL;
