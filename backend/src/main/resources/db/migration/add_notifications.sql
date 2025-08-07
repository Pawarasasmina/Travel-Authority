-- Add notification tables to existing database
-- Run this script to add the notification functionality

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('OFFER', 'ALERT', 'UPDATE', 'SYSTEM', 'BOOKING_CONFIRMATION', 'PAYMENT_SUCCESS') NOT NULL,
    target_user_type ENUM('ALL_USERS', 'NORMAL_USERS', 'ACTIVITY_OWNERS', 'SPECIFIC_USER') NOT NULL,
    target_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    action_url VARCHAR(500) NULL,
    icon_url VARCHAR(500) NULL,
    created_by INT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id),
    INDEX idx_target_user_type (target_user_type),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
);

-- Create user_notification_status table
CREATE TABLE IF NOT EXISTS user_notification_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_notification_user (notification_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Insert some sample notifications for testing
INSERT INTO notifications (title, message, type, target_user_type, created_at) VALUES
('Welcome to Travel Authority', 'Welcome to our travel booking platform! Explore amazing destinations and book your next adventure.', 'SYSTEM', 'ALL_USERS', NOW()),
('Special Offer Alert', 'Get 20% off on all beach activities this summer! Limited time offer ending soon.', 'OFFER', 'ALL_USERS', NOW()),
('System Maintenance Notice', 'Scheduled maintenance on Sunday 2AM-4AM. Service may be temporarily unavailable.', 'ALERT', 'ALL_USERS', NOW() + INTERVAL 1 HOUR),
('Activity Owner Welcome', 'Welcome to Travel Authority! Start adding your activities and reach more customers.', 'SYSTEM', 'ACTIVITY_OWNERS', NOW() + INTERVAL 2 HOUR);

-- Update any existing admin user to create the notifications (assuming admin user exists with id 1)
UPDATE notifications SET created_by = 1 WHERE created_by IS NULL;
