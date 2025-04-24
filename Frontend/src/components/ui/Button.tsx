import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'text-lg font-semibold cursor-pointer rounded-[20px] border-none transition-all duration-200 h-[60px] max-sm:h-[50px]';
  
  const variantClasses = {
    primary: 'text-white shadow-[0_4px_4px_rgba(0,0,0,0.25),0_1px_1px_rgba(0,0,0,0.25)_inset] bg-gradient-to-r from-[#FF7F50] to-[#BF360C]',
    secondary: 'bg-[#EEE] text-black shadow-[0_4px_4px_rgba(0,0,0,0.25)]',
    outline: 'bg-transparent text-[#FF7F50] border-2 border-[#FF7F50]'
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
