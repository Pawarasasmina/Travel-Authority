import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from '../components/ui/Button';
import ProfileField from '../components/ui/ProfileField';
import { useAuth } from '../contexts/AuthContext';
import { UpdateProfileData } from '../api/authApi';

const Profile = () => {
  const navigate = useNavigate();
  
  // State to track if edit mode is active
  const [isEditing, setIsEditing] = useState(false);
  // Get user data and update function from Auth context
  const { user, updateUser } = useAuth();
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  // State for error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // State for success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
    // State for user information
  const [userInfo, setUserInfo] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : "Not available",
    phone: user ? user.phoneNumber : "Not available",
    birthdate: user && user.birthdate ? user.birthdate : "",
    email: user ? user.email : "Not available",
    gender: user && user.gender ? user.gender : "",
    password: "********"
  });
  
  // Update userInfo when user data changes
  useEffect(() => {
    if (user) {
      console.log('User data received in profile:', {
        fullUser: user,
        birthdate: user.birthdate, 
        gender: user.gender
      });
      
      setUserInfo({
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phoneNumber || "Not available",
        birthdate: user.birthdate || "",  // Empty string better for date inputs
        email: user.email || "Not available",
        gender: user.gender || "",  // Empty string better for select inputs
        password: "********"
      });
    }
  }, [user]);
  
  const handleInputChange = (field: string, value: string) => {
    setUserInfo({
      ...userInfo,
      [field]: value
    });
    
    // Clear any previous messages when user starts editing
    setErrorMessage(null);
    setSuccessMessage(null);
  };
  
  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes to backend
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
        try {
        // Extract first and last name from the name field
        const nameParts = userInfo.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        // Log the values being processed
        console.log('Profile update - processing fields:', {
          birthdate: userInfo.birthdate,
          gender: userInfo.gender
        });
        
        // Prepare data for API call
        const updateData: UpdateProfileData = {
          firstName,
          lastName,
          email: userInfo.email !== "Not available" ? userInfo.email : undefined,
          phoneNumber: userInfo.phone !== "Not available" ? userInfo.phone : undefined,
          birthdate: userInfo.birthdate !== "Not available" ? userInfo.birthdate : undefined,
          gender: userInfo.gender !== "Not available" ? userInfo.gender : undefined
        };
        
        // Call the updateUser function from AuthContext
        const success = await updateUser(updateData);
        
        if (success) {
          setSuccessMessage("Profile updated successfully!");
        } else {
          setErrorMessage("Failed to update profile. Please try again.");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    setIsEditing(!isEditing);
  };
  
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  // Icons for the profile fields
  const icons = {
    name: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    phone: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    birthdate: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    email: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      </svg>
    ),
    gender: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    password: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    )
  };

  return (
    <div className="min-h-screen flex flex-col mt-12">
      {/* Header Background */}
      <div className="h-64  inset-0  z-0 bg-cover bg-center relative" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop')" }}>
        {/* Change Password Button */}
        <div 
          className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleChangePassword}
          title="Change Password"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>      {/* Profile Picture */}
      <div className="flex justify-center">
        <div className="w-48 h-48 rounded-full bg-white p-1 relative -mt-32">
          <img 
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop" 
            alt="Profile" 
            className="w-full h-full object-cover rounded-full"
          />
          {isEditing && (
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 pt-20 pb-10 max-w-4xl">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-200 rounded">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </p>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </p>
          </div>
        )}
        
        {/* Bio */}
        <p className="text-center text-gray-700 mb-8">
          Passionate traveler and computer science engineer; exploring the world one destination at a time! I love discovering new places, experiencing different cultures, and using technology to enhance travel experiences. Always making the most of life.
        </p>

        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <ProfileField 
            icon={icons.name}
            label="Name"
            type="text"
            id="name"
            value={userInfo.name}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('name', value)}
          />
          
          <ProfileField 
            icon={icons.phone}
            label="Phone"
            type="tel"
            id="phone"
            value={userInfo.phone}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('phone', value)}
          />
          
          <ProfileField 
            icon={icons.birthdate}
            label="Birthdate"
            type="date"
            id="birthdate"
            value={userInfo.birthdate}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('birthdate', value)}
          />
          
          <ProfileField 
            icon={icons.email}
            label="Email"
            type="email"
            id="email"
            value={userInfo.email}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('email', value)}
          />
          
          <ProfileField 
            icon={icons.gender}
            label="Gender"
            type="select"
            id="gender"
            value={userInfo.gender}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('gender', value)}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
              { value: 'Prefer not to say', label: 'Prefer not to say' }
            ]}
          />
          
          <ProfileField 
            icon={icons.password}
            label="Password"
            type="password"
            id="password"
            value={userInfo.password}
            isEditing={false} // Password is not editable here
            onChange={(value) => handleInputChange('password', value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            className="px-12"
            onClick={handleEditToggle}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : isEditing ? "Save Profile" : "Edit Profile"}
          </Button>
          {isEditing ? (
            <Button 
              variant="secondary"
              className="px-12"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          ) : (
            <Button 
              variant="secondary"
              className="px-12"
              onClick={handleLogout}
              disabled={isLoading}
            >
              Log Out
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="mt-4 text-center">
          {isLoading && <p className="text-blue-500">Saving changes...</p>}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {successMessage && <p className="text-green-500">{successMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Profile;
