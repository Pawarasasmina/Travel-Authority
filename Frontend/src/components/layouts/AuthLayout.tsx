import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-neutral-100 p-4 relative overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-white opacity-40"></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 0.85 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-[1100px] shadow-md bg-white rounded-[20px] max-md:flex-col max-md:max-w-[500px] max-sm:rounded-md relative"
      >
        <motion.img
          initial={{ x: isLogin ? -100 : 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={image}
          alt="Background image"
          className={`w-3/5 object-cover h-[700px] ${
            imagePosition === 'left' 
              ? 'rounded-l-[20px] max-md:rounded-t-lg' 
              : 'rounded-r-[20px] max-md:rounded-b-lg max-md:order-first'
          } max-md:w-full max-md:h-[150px]`}
        />
        <motion.div 
          initial={{ x: isLogin ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-2/5 flex flex-col items-center px-4 py-6 max-md:w-full max-md:px-3 max-md:py-4"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
