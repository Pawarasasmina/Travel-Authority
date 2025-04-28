import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '../components/ui/Button';
import ProfileField from '../components/ui/ProfileField';

const Profile = () => {
  const navigate = useNavigate();
  
  // State to track if edit mode is active
  const [isEditing, setIsEditing] = useState(false);
  
  // State for user information
  const [userInfo, setUserInfo] = useState({
    name: "James Jayasuriya",
    phone: "071/2125867",
    birthdate: "21 Feb 1999",
    email: "james123@gmail.com",
    gender: "Male",
    password: "********"
  });
  
  const handleInputChange = (field: string, value: string) => {
    setUserInfo({
      ...userInfo,
      [field]: value
    });
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save logic would go here
      console.log("Saving profile:", userInfo);
    }
    setIsEditing(!isEditing);
  };
  
  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
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
    <div className="min-h-screen flex flex-col">
      {/* Header Background */}
      <div className="h-64 bg-cover bg-center relative" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop')" }}>
      </div>

      {/* Profile Picture */}
      <div className="flex justify-center">
        <div className="w-48 h-48 rounded-full bg-white p-1 absolute -mt-32">
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
            type="text"
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
            type="text"
            id="gender"
            value={userInfo.gender}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('gender', value)}
          />
          
          <ProfileField 
            icon={icons.password}
            type="password"
            id="password"
            value={userInfo.password}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('password', value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            className="px-12"
            onClick={handleEditToggle}
          >
            {isEditing ? "Save Profile" : "Edit Profile"}
          </Button>
          {isEditing ? (
            <Button 
              variant="secondary"
              className="px-12"
              onClick={() => setIsEditing(false)}
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
