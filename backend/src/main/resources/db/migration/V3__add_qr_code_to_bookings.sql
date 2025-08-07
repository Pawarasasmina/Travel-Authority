-- Add QR code data field to bookings table
-- Migration: V3__add_qr_code_to_bookings.sql

ALTER TABLE bookings ADD COLUMN qr_code_data VARCHAR(2000);

-- Update existing bookings to have QR code data
-- This will generate QR codes for existing bookings
UPDATE bookings 
SET qr_code_data = CONCAT(
    '{"ticketId":"', id, 
    '","eventTitle":"', title, 
    '","date":"', booking_date, 
    '","persons":', total_persons,
    ',"orderNumber":"', COALESCE(order_number, ''), 
    '","status":"', status, 
    '","verificationCode":"VER-', id, '-', UNIX_TIMESTAMP() * 1000,
    '","timestamp":', UNIX_TIMESTAMP() * 1000, '}'
)
WHERE qr_code_data IS NULL;
