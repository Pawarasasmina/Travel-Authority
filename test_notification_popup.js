// Test script to create a notification via admin API
// This will demonstrate the real-time notification popup

const testNotificationPopup = async () => {
  const adminToken = 'YOUR_ADMIN_JWT_TOKEN_HERE'; // Replace with actual admin token
  
  const testNotification = {
    title: "🎉 Welcome! New Feature Available",
    message: "You can now receive instant notifications about important updates, offers, and system alerts. Click 'View Details' to explore more features!",
    type: "UPDATE",
    targetUserType: "ALL_USERS",
    actionUrl: "/home"
  };

  try {
    const response = await fetch('http://localhost:8080/api/v1/admin/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(testNotification)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test notification created successfully!');
      console.log('📧 Notification details:', result.data);
      console.log('🎯 Target users will see this notification popup within 30 seconds');
    } else {
      console.error('❌ Failed to create notification:', result);
    }
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
  }
};

// Usage instructions:
console.log('📋 Notification Popup Test Instructions:');
console.log('1. Make sure both backend (8080) and frontend (5173) are running');
console.log('2. Login as an admin user and get your JWT token');
console.log('3. Replace YOUR_ADMIN_JWT_TOKEN_HERE with your actual admin token');
console.log('4. Run: testNotificationPopup()');
console.log('5. Login as a regular user and wait up to 30 seconds to see the popup');
console.log('');
console.log('🔄 The notification system checks for new notifications every 30 seconds');
console.log('💡 You can also trigger immediate check by refreshing the page');

// Uncomment the line below to run the test (after adding your admin token)
// testNotificationPopup();
