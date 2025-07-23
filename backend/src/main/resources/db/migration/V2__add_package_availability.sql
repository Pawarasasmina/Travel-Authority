-- Add availability column to packages table if it doesn't exist
ALTER TABLE packages
ADD COLUMN IF NOT EXISTS availability INT DEFAULT 0 NOT NULL;

-- For existing packages, set availability to a default value
UPDATE packages
SET availability = 10
WHERE availability IS NULL;

-- Make sure the column is not nullable
ALTER TABLE packages
ALTER COLUMN availability SET NOT NULL;

-- Add a comment explaining the field
COMMENT ON COLUMN packages.availability IS 'Number of spots available specifically for this package';
