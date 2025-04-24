import React from 'react';
import bgImage from '../../assets/login-signup/background-login.jpg';

interface AuthLayoutProps {
  children: React.ReactNode;
  imagePosition?: 'left' | 'right';
  image?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children,
  imagePosition = 'left',
  image = "https://cdn.builder.io/api/v1/image/assets/TEMP/45bbe1598e1eb471892256d1ee93adaff5876552"
}) => {
  return (
    <div
      className="flex justify-center items-center min-h-screen bg-neutral-100 p-4 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-white opacity-40"></div>
      <div className="flex w-full max-w-[1100px] scale-[0.85] shadow-md bg-white rounded-[20px] max-md:flex-col max-md:max-w-[500px] max-sm:rounded-md relative">
        {imagePosition === 'left' && (
          <img
            src={image}
            alt="Background image"
            className="w-3/5 object-cover h-[700px] rounded-l-[20px] max-md:w-full max-md:h-[150px] max-md:rounded-t-lg"
          />
        )}
        <div className="w-2/5 flex flex-col items-center px-4 py-6 max-md:w-full max-md:px-3 max-md:py-4">
          {children}
        </div>
        {imagePosition === 'right' && (
          <img
            src={image}
            alt="Background image"
            className="w-3/5 object-cover h-[700px] rounded-r-[20px] max-md:w-full max-md:h-[150px] max-md:rounded-b-lg max-md:order-first"
          />
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
