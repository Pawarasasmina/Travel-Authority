import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={props.id} className="text-[15px] text-black">
            {label}
          </label>
        )}
        <div className="flex items-center gap-4 border h-[55px] bg-white px-4 py-2 rounded-[16px] border-solid border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.2)] max-sm:h-[50px]">
          {icon && <div>{icon}</div>}
          <input
            ref={ref}
            className={`w-full text-[15px] text-black border-[none] focus:outline-none bg-transparent ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
