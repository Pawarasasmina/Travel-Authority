/**
 * Update Package Availability Script
 * 
 * Run this script to ensure all packages have a valid availability value
 * This is useful after adding the availability field to the Package entity
 */

const updatePackageAvailability = async () => {
  try {
    // Get all activities
    const response = await fetch('/api/v1/activity/all');
    const activities = await response.json();
    
    if (!activities.data || !Array.isArray(activities.data)) {
      console.error('Failed to fetch activities or unexpected response format');
      return;
    }
    
    // Counters for reporting
    let activitiesWithPackages = 0;
    let totalPackages = 0;
    let updatedPackages = 0;
    
    // Process each activity
    for (const activity of activities.data) {
      if (activity.packages && activity.packages.length > 0) {
        activitiesWithPackages++;
        totalPackages += activity.packages.length;
        
        // Check if any package needs an availability value
        let needsUpdate = false;
        for (const pkg of activity.packages) {
          if (pkg.availability === undefined || pkg.availability === null) {
            pkg.availability = activity.availability > 0 ? activity.availability : 10;
            needsUpdate = true;
            updatedPackages++;
          }
        }
        
        // Update the activity if needed
        if (needsUpdate) {
          const updateResponse = await fetch(`/api/v1/activity/update/${activity.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(activity)
          });
          
          if (updateResponse.ok) {
            console.log(`Updated activity #${activity.id}: ${activity.title}`);
          } else {
            console.error(`Failed to update activity #${activity.id}: ${activity.title}`);
          }
        }
      }
    }
    
    console.log('Update complete:');
    console.log(`- ${activitiesWithPackages} activities with packages processed`);
    console.log(`- ${totalPackages} total packages found`);
    console.log(`- ${updatedPackages} packages updated with availability values`);
    
  } catch (error) {
    console.error('Error updating package availability:', error);
  }
};

// Run the update function
updatePackageAvailability();
