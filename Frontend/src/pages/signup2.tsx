// login.tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/background-login.jpg'; 

interface RegistrationFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

// Divider component
function Divider({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-px bg-[#E6E6E6]" />
      {children && <div className="text-[#828282] text-sm">{children}</div>}
      <div className="flex-1 h-px bg-[#E6E6E6]" />
    </div>
  );
}

// Login Form component
function RegistrationForm() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<RegistrationFormData>();

  const onSubmit = (data: RegistrationFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[327px]">
      <div className="text-[44px] font-bold text-center mb-[29px] max-sm:text-[32px]">
        Register
      </div>
      <div className="flex flex-col gap-3 mb-8 max-sm:gap-2">
       
      <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-[15px] text-black">
            Password
          </label>
          <div className="flex items-center gap-4 border h-[55px] bg-white px-4 py-2 rounded-[10px] border-solid border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] max-sm:h-[50px]">
            <input
              id="password"
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full text-[15px] text-black border-[none] focus:outline-none bg-transparent"
            />
          </div>
        </div>
       
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-[15px] text-black">
            Confirm Password
          </label>
          <div className="flex items-center gap-4 border h-[55px] bg-white px-4 py-2 rounded-[10px] border-solid border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] max-sm:h-[50px]">
            <input
              id="confirmpassword"
              type="password"
              placeholder="Confirm Password"
              {...register("password")}
              className="w-full text-[15px] text-black border-[none] focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="w-full h-[60px] text-white text-lg font-semibold cursor-pointer shadow-[0_4px_4px_rgba(0,0,0,0.25),0_1px_1px_rgba(0,0,0,0.25)_inset] rounded-[20px] border-none bg-gradient-to-r from-[#FF7F50] to-[#BF360C] max-sm:h-[50px]"
      >
        Register
      </button>
      
    </form>
  );
}

// Main login page component
export default function Registration2() {
  return (
    <div
      className="flex justify-center items-center min-h-screen bg-neutral-100 p-4 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-white opacity-20"></div> {/* Overlay */}
      <div className="flex w-full max-w-[1100px] scale-[0.85] shadow-md bg-white rounded-[20px] max-md:flex-col max-md:max-w-[500px] max-sm:rounded-md relative">
        
        <div className="w-2/5 flex flex-col items-center px-4 py-6 max-md:w-full max-md:px-3 max-md:py-4">
          <RegistrationForm />
         
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/45bbe1598e1eb471892256d1ee93adaff5876552"
          alt="Mountain lake view from wooden boat"
          className="w-3/5 object-cover h-[700px] rounded-r-[20px] max-md:w-full max-md:h-[150px] max-md:rounded-t-lg"
        />
      </div>
    </div>
  );
}