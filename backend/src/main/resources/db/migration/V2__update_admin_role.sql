-- Update admin@gmail.com user to have ADMIN role
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@gmail.com';

-- Ensure all other users have USER role
UPDATE users SET role = 'USER' WHERE role IS NULL OR role != 'ADMIN';
