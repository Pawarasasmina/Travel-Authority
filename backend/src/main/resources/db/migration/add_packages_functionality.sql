-- Migration script to add packages functionality to the activity system
-- Run this script to update your database schema

-- Add new columns to the activity table
ALTER TABLE activity 
ADD COLUMN IF NOT EXISTS duration VARCHAR(255),
ADD COLUMN IF NOT EXISTS additional_info TEXT,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    activity_id INT,
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE
);

-- Create package_features table for storing package features
CREATE TABLE IF NOT EXISTS package_features (
    package_id BIGINT,
    feature VARCHAR(500),
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Create activity_highlights table for storing activity highlights
CREATE TABLE IF NOT EXISTS activity_highlights (
    activity_id INT,
    highlight VARCHAR(500),
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE
);

-- Create activity_categories table for storing activity categories
CREATE TABLE IF NOT EXISTS activity_categories (
    activity_id INT,
    category VARCHAR(255),
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE
);

-- Insert some sample data for testing (optional)
-- You can uncomment these lines if you want to add sample activities with packages

/*
-- Sample activity 1: White Water Rafting
INSERT INTO activity (title, location, image, price, availability, rating, description, duration, additional_info, active) 
VALUES ('White Water Rafting Adventure', 'Kitulgala', 
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3', 
        4500, 20, 4.8, 
        'Experience the thrill of white water rafting in the beautiful Kelani River. Perfect for adventure seekers!',
        '4 hours', 
        'Includes safety equipment, professional guide, and light refreshments.',
        TRUE);

-- Add packages for White Water Rafting
INSERT INTO packages (name, description, price, activity_id) VALUES 
('Standard Package', 'Basic rafting experience with safety gear', 4500, LAST_INSERT_ID()),
('Premium Package', 'Includes photos, lunch, and transport', 6500, LAST_INSERT_ID()),
('Family Package', 'Special package for families with children', 5500, LAST_INSERT_ID());

-- Add features for the packages
INSERT INTO package_features (package_id, feature) VALUES 
((SELECT id FROM packages WHERE name = 'Standard Package' LIMIT 1), 'Safety equipment'),
((SELECT id FROM packages WHERE name = 'Standard Package' LIMIT 1), 'Professional guide'),
((SELECT id FROM packages WHERE name = 'Standard Package' LIMIT 1), 'Light refreshments'),
((SELECT id FROM packages WHERE name = 'Premium Package' LIMIT 1), 'All Standard features'),
((SELECT id FROM packages WHERE name = 'Premium Package' LIMIT 1), 'Professional photography'),
((SELECT id FROM packages WHERE name = 'Premium Package' LIMIT 1), 'Lunch included'),
((SELECT id FROM packages WHERE name = 'Premium Package' LIMIT 1), 'Transport from hotel'),
((SELECT id FROM packages WHERE name = 'Family Package' LIMIT 1), 'Child-friendly activities'),
((SELECT id FROM packages WHERE name = 'Family Package' LIMIT 1), 'Family safety equipment'),
((SELECT id FROM packages WHERE name = 'Family Package' LIMIT 1), 'Snacks for kids');

-- Add highlights and categories for the activity
INSERT INTO activity_highlights (activity_id, highlight) VALUES 
(LAST_INSERT_ID(), 'Thrilling 2-hour rafting experience'),
(LAST_INSERT_ID(), 'Beautiful Kelani River scenery'),
(LAST_INSERT_ID(), 'Professional safety equipment'),
(LAST_INSERT_ID(), 'Experienced local guides'),
(LAST_INSERT_ID(), 'Light refreshments included');

INSERT INTO activity_categories (activity_id, category) VALUES 
(LAST_INSERT_ID(), 'Adventure'),
(LAST_INSERT_ID(), 'Water Activities');
*/
