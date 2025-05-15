import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'alert' | 'cancel';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-semibold cursor-pointer rounded-2xl transition-all duration-200';
  
  const variantClasses = {
    primary: 'text-white shadow-[0_4px_4px_rgba(0,0,0,0.25),0_1px_1px_rgba(0,0,0,0.25)_inset] bg-gradient-to-r from-[#FF7F50] to-[#BF360C] h-[50px] max-sm:h-[50px]',
    secondary: 'bg-[#EEE] text-black shadow-[0_4px_4px_rgba(0,0,0,0.25)] h-[50px] max-sm:h-[50px]',
    outline: 'bg-transparent text-[#FF7F50] border-2 border-[#FF7F50] h-[50px] max-sm:h-[50px]',
    // New variants for alerts
    danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm',
    success: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm',
    alert: 'bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm',
    cancel: 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
