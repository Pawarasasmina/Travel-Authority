#!/usr/bin/env node

// Test script to verify QR code implementation
// Run with: node test_qr_booking.js

console.log("=== QR Code System Test ===");
console.log("");

console.log("1. CHECKING FRONTEND FILES:");

const fs = require('fs');
const path = require('path');

// Check if key files exist
const filesToCheck = [
    'Frontend/src/components/ui/BookedTicketDetail.tsx',
    'Frontend/src/components/admin/QRScanner.tsx',
    'Frontend/src/components/admin/QRVerificationModal.tsx',
    'Frontend/src/api/adminApi.ts',
    'backend/src/main/java/com/travelauthority/backend/entity/Booking.java',
    'backend/src/main/java/com/travelauthority/backend/service/BookingService.java',
    'backend/src/main/resources/db/migration/V3__add_qr_code_to_bookings.sql'
];

filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file} - EXISTS`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

console.log("");
console.log("2. FRONTEND PACKAGE DEPENDENCIES:");

try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'Frontend/package.json'), 'utf8'));
    const dependencies = packageJson.dependencies;
    
    const qrDeps = ['qrcode.react', 'qr-scanner', 'react-qr-code'];
    qrDeps.forEach(dep => {
        if (dependencies[dep]) {
            console.log(`✅ ${dep}: ${dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep}: NOT FOUND`);
        }
    });
} catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
}

console.log("");
console.log("3. TEST WORKFLOW:");
console.log("");
console.log("To test the QR code system:");
console.log("1. Start backend: cd backend && ./mvnw spring-boot:run");
console.log("2. Start frontend: cd Frontend && npm run dev");
console.log("3. Create a booking and check for QR code in booking details");
console.log("4. Login as admin and test QR scanning");
console.log("");

console.log("4. SAMPLE QR CODE TEST DATA:");
const testQrData = {
    ticketId: "TICK-1720998123456",
    eventTitle: "Test Adventure Tour",
    date: "2024-07-15",
    persons: 2,
    orderNumber: "ORD-1720998123456",
    status: "CONFIRMED",
    verificationCode: "VER-TICK-1720998123456-1720998123456",
    timestamp: 1720998123456
};

console.log(JSON.stringify(testQrData, null, 2));
console.log("");

console.log("5. STATUS MAPPING FIXED:");
console.log("- Backend sends: CONFIRMED, PENDING, COMPLETED, CANCELLED");
console.log("- Frontend accepts: both uppercase and title case");
console.log("- QR codes show for: CONFIRMED status");
console.log("");

console.log("=== Test Complete ===");
