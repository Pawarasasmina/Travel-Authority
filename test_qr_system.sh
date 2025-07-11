#!/bin/bash

# QR Code System Test Script
# This script helps test the QR code functionality

echo "=== QR Code System Test Guide ==="
echo ""

echo "1. BACKEND TESTING:"
echo "   - Start the backend server:"
echo "   - cd backend && ./mvnw spring-boot:run"
echo "   - Or use the VS Code task: 'Run Backend (with Database Fix)'"
echo ""

echo "2. DATABASE MIGRATION:"
echo "   - The V3__add_qr_code_to_bookings.sql migration will automatically run"
echo "   - This adds the qr_code_data column to the bookings table"
echo "   - Existing bookings will get QR codes generated"
echo ""

echo "3. FRONTEND TESTING:"
echo "   - Start the frontend development server:"
echo "   - cd Frontend && npm run dev"
echo "   - Open http://localhost:5173"
echo ""

echo "4. TEST WORKFLOW:"
echo ""
echo "   A. Customer Side:"
echo "      - Register/login as a regular user"
echo "      - Browse activities and make a booking"
echo "      - Complete payment process"
echo "      - Navigate to 'My Bookings' or 'Purchase List'"
echo "      - Click 'View Details' on a confirmed booking"
echo "      - Verify QR code is displayed at the bottom"
echo ""
echo "   B. Admin Side:"
echo "      - Login as admin user"
echo "      - Navigate to 'Manage Bookings' in admin panel"
echo "      - Click 'Scan QR Code' button"
echo "      - Allow camera permissions when prompted"
echo "      - Point camera at a customer's QR code"
echo "      - Verify booking details are displayed"
echo "      - Test 'Mark as Used' functionality"
echo ""

echo "5. API TESTING:"
echo "   - Test QR verification endpoint:"
echo "   - POST http://localhost:8080/api/v1/bookings/verify-qr"
echo "   - Content-Type: application/json"
echo "   - Body: QR code JSON data"
echo ""

echo "6. BROWSER REQUIREMENTS:"
echo "   - Chrome/Firefox/Safari with camera access"
echo "   - HTTPS may be required for camera in some browsers"
echo "   - For local testing, localhost should work"
echo ""

echo "7. TROUBLESHOOTING:"
echo "   - If QR scanner doesn't work: Check camera permissions"
echo "   - If QR codes don't generate: Check backend logs for errors"
echo "   - If verification fails: Ensure QR code data format is correct"
echo ""

echo "8. SAMPLE QR CODE DATA:"
cat << 'EOF'
{
  "ticketId": "TICK-1720998123456",
  "eventTitle": "Adventure Tour",
  "date": "2024-07-15",
  "persons": 2,
  "orderNumber": "ORD-1720998123456",
  "status": "CONFIRMED",
  "verificationCode": "VER-TICK-1720998123456-1720998123456",
  "timestamp": 1720998123456
}
EOF

echo ""
echo "=== Test completed! ==="
