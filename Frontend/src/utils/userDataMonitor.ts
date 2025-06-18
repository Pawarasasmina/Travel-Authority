// This file will log user data in localStorage to help troubleshoot 
// the birthdate and gender update issues

// Function to check localStorage and console.log data
export function monitorUserData() {
    // Set up a storage event listener to detect changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'user') {
            console.log('[MONITOR] User data changed in localStorage', e.newValue);
            const userData = JSON.parse(e.newValue || '{}');
            console.log('[MONITOR] New user data:', {
                birthdate: userData.birthdate,
                gender: userData.gender
            });
        }
    });
    
    // Also check current data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('[MONITOR] Current user data in localStorage:', {
        birthdate: userData.birthdate,
        gender: userData.gender,
        fullData: userData
    });
}

// Function to fix any existing user data in localStorage
export function fixUserData() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.id) {
        console.log('[FIX] Checking user data for fix');
        // Make sure birthdate and gender are preserved
        if (!userData.birthdate) {
            console.log('[FIX] Setting default birthdate');
            userData.birthdate = '';
        }
        
        if (!userData.gender) {
            console.log('[FIX] Setting default gender');
            userData.gender = '';
        }
        
        console.log('[FIX] Updated user data:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }
}
