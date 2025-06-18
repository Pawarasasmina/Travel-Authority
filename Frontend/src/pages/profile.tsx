import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from '../components/ui/Button';
import ProfileField from '../components/ui/ProfileField';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/authApi';
import { debugLog } from '../utils/debug';

const Profile = () => {
  const navigate = useNavigate();
  
  // State to track if edit mode is active
  const [isEditing, setIsEditing] = useState(false);
  
  // For showing loading state during profile update
  const [isLoading, setIsLoading] = useState(false);
  
  // For showing image upload loading state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // For showing error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // For showing success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
    // For file input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // For profile image preview
  const [profileImage, setProfileImage] = useState<string>("https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop");
  
  // Get user data from Auth context
  const { user, login } = useAuth();
  
  // State for user information
  const [userInfo, setUserInfo] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : "Not available",
    phone: user ? user.phoneNumber : "Not available",
    birthdate: user?.birthdate || "Not available", // This might be updated from backend
    email: user ? user.email : "Not available",
    gender: user?.gender || "Not available", // This might be updated from backend
    password: "********"
  });
    // Effect to reset messages when editing state changes
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isEditing]);

  const handleInputChange = (field: string, value: string) => {
    setUserInfo({
      ...userInfo,
      [field]: value
    });
  };
  
  const parseNameField = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };
  
  // Function to validate profile data before saving
  const validateProfileData = () => {
    // Check if email is valid
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(userInfo.email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    
    // Check if phone number is valid (simple validation for demo)
    if (userInfo.phone === "Not available" || userInfo.phone.trim() === "") {
      setErrorMessage("Please enter a valid phone number");
      return false;
    }
    
    // Check if name is valid
    if (userInfo.name === "Not available" || userInfo.name.trim() === "") {
      setErrorMessage("Please enter your full name");
      return false;
    }
    
    return true;
  };
  
  const handleEditToggle = async () => {
    // If currently editing, we need to save the changes
    if (isEditing) {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        
        if (!user || !user.id) {
          setErrorMessage("User information is missing. Please log in again.");
          setIsEditing(false);
          return;
        }
        
        // Validate profile data before sending to server
        const isValid = validateProfileData();
        if (!isValid) {
          setIsLoading(false);
          return;
        }
        
        debugLog('PROFILE', 'Current user info to update:', userInfo);
        
        // Parse the name field into firstName and lastName
        const { firstName, lastName } = parseNameField(userInfo.name);
        
        // Build update payload (only include fields that should be updated)
        const updateData = {
          firstName, 
          lastName,
          email: userInfo.email,
          phoneNumber: userInfo.phone,
          birthdate: userInfo.birthdate !== "Not available" ? userInfo.birthdate : undefined,
          gender: userInfo.gender !== "Not available" ? userInfo.gender : undefined
        };
        
        debugLog('PROFILE', 'Sending update with data:', updateData);
        
        // Call API to update profile
        const response = await authApi.updateUserProfile(user.id, updateData);
        
        if (response.status === "OK" || response.status === "200 OK" || response.status === "UPDATED") {
          debugLog('PROFILE', 'Profile updated successfully', response.data);
          
          // Update the user in auth context with the new data
          const updatedUser = {
            ...user,
            firstName,
            lastName,
            email: userInfo.email,
            phoneNumber: userInfo.phone,
            // Add additional fields if they're returned by the API
            ...(userInfo.birthdate !== "Not available" && { birthdate: userInfo.birthdate }),
            ...(userInfo.gender !== "Not available" && { gender: userInfo.gender })
          };
          
          // Update the auth context with the new user data
          login(updatedUser);
          
          setSuccessMessage("Profile updated successfully!");
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        } else {
          debugLog('PROFILE', 'Profile update failed', response);
          setErrorMessage(response.message || "Failed to update profile. Please try again.");
        }
      } catch (error) {
        debugLog('PROFILE', 'Error updating profile', error);
        setErrorMessage("An error occurred while updating your profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    // Toggle edit mode
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

  // Function to handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;
    
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    // Upload to server if user is authenticated
    if (user && user.id) {
      uploadProfileImage(file, user.id);
    } else {
      setErrorMessage("You must be logged in to upload a profile image");
    }
  };
  
  // Function to upload profile image to server
  const uploadProfileImage = async (file: File, userId: number) => {
    try {
      setIsUploadingImage(true);
      setErrorMessage(null);
      
      const response = await authApi.uploadProfileImage(userId, file);
      
      if (response.status === "OK" || response.status === "200 OK" || response.status === "UPDATED") {
        debugLog('PROFILE', 'Profile image uploaded successfully', response.data);
        setSuccessMessage("Profile image updated successfully!");
        
        // If the API returns the updated image URL, update the profile image
        if (response.data && response.data.imageUrl) {
          setProfileImage(response.data.imageUrl);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        debugLog('PROFILE', 'Profile image upload failed', response);
        setErrorMessage(response.message || "Failed to upload profile image. Please try again.");
      }
    } catch (error) {
      debugLog('PROFILE', 'Error uploading profile image', error);
      setErrorMessage("An error occurred while uploading your profile image.");
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    <div className="min-h-screen flex flex-col mt-12">      {/* Header Background */}
      <div className="h-64 z-0 bg-cover bg-center relative" 
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
        <div className="w-48 h-48 rounded-full bg-white p-1 -mt-32 relative">
          <img 
            src={profileImage}
            alt="Profile" 
            className="w-full h-full object-cover rounded-full"
          />
          {isEditing && (
            <div 
              className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer"
              onClick={triggerFileInput}
            >
              {isUploadingImage ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-gray-600 rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden file input for image upload */}
      <input 
        type="file" 
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* Profile Content */}
      <div className="container mx-auto px-4 pt-20 pb-10 max-w-4xl">
        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <p>{errorMessage}</p>
          </div>
        )}
        
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
            <p>{successMessage}</p>
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
            type="text"
            id="name"
            value={userInfo.name}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('name', value)}
          />
          
          <ProfileField 
            icon={icons.phone}
            type="tel"
            id="phone"
            value={userInfo.phone}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('phone', value)}
          />
            <ProfileField 
            icon={icons.birthdate}
            type="date"
            id="birthdate"
            value={userInfo.birthdate}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('birthdate', value)}
          />
          
          <ProfileField 
            icon={icons.email}
            type="email"
            id="email"
            value={userInfo.email}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('email', value)}
          />
          
          <ProfileField 
            icon={icons.gender}
            type="select"
            id="gender"
            value={userInfo.gender}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('gender', value)}
            options={["Male", "Female", "Other", "Prefer not to say"]}
          />
          
          <ProfileField 
            icon={icons.password}
            type="password"
            id="password"
            value={userInfo.password}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('password', value)}
          />
        </div>        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            className="px-12"
            onClick={handleEditToggle}
            disabled={isLoading}
          >
            {isEditing 
              ? (isLoading ? "Saving..." : "Save Profile") 
              : "Edit Profile"}
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
            >
              Log Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
