-- Add the new columns to the users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(255);
