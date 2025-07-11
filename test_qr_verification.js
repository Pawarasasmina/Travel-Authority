const axios = require('axios');

// QR code data from your example
const qrCodeData = '{"ticketId":"TICK-1752052434284","eventTitle":"121212","date":"2025-07-22","persons":7,"orderNumber":"ORD-1752052434284","status":"PENDING","verificationCode":"VER-TICK-1752052434284-1753142400000"}';

async function testQRVerification() {
    try {
        console.log('Testing QR code verification...');
        console.log('QR Data:', qrCodeData);
        
        const response = await axios.post('http://localhost:8080/api/v1/bookings/verify-qr', {
            qrCodeData: qrCodeData
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-User-Email': 'admin@test.com'
            }
        });
        
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

testQRVerification();
