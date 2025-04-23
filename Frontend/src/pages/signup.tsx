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
        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className="text-[15px] text-black">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="First Name"
            {...register("firstName")}
            className="w-full h-[45px] text-[15px] text-black border border-[#E0E0E0] rounded-[10px] px-3 focus:outline-none shadow-[0_2px_4px_rgba(0,0,0,0.1)] bg-transparent"
          />
        </div>
        {/* Last Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="text-[15px] text-black">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Last Name"
            {...register("lastName")}
            className="w-full h-[45px] text-[15px] text-black border border-[#E0E0E0] rounded-[10px] px-3 focus:outline-none shadow-[0_2px_4px_rgba(0,0,0,0.1)] bg-transparent"
          />
        </div>
         {/* Email */}
         <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-[15px] text-black">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            {...register("email")}
            className="w-full h-[45px] text-[15px] text-black border border-[#E0E0E0] rounded-[10px] px-3 focus:outline-none shadow-[0_2px_4px_rgba(0,0,0,0.1)] bg-transparent"
          />
        </div>
        {/* Phone Number */}
        <div className="flex flex-col gap-1">
          <label htmlFor="phoneNumber" className="text-[15px] text-black">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            placeholder="Phone Number"
            {...register("phoneNumber")}
            className="w-full h-[45px] text-[15px] text-black border border-[#E0E0E0] rounded-[10px] px-3 focus:outline-none shadow-[0_2px_4px_rgba(0,0,0,0.1)] bg-transparent"
          />
        </div>
       
        {/* NIC */}
        <div className="flex flex-col gap-1">
          <label htmlFor="nic" className="text-[15px] text-black">
            NIC Number
          </label>
          <input
            id="nic"
            type="text"
            placeholder="NIC number"
            {...register("password")}
            className="w-full h-[45px] text-[15px] text-black border border-[#E0E0E0] rounded-[10px] px-3 focus:outline-none shadow-[0_2px_4px_rgba(0,0,0,0.1)] bg-transparent"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full h-[60px] text-white text-lg font-semibold cursor-pointer shadow-[0_4px_4px_rgba(0,0,0,0.25),0_1px_1px_rgba(0,0,0,0.25)_inset] rounded-[20px] border-none bg-gradient-to-r from-[#FF7F50] to-[#BF360C] max-sm:h-[50px]"
        onClick={() => navigate('/signup2')}
     >
        Next
      </button>
      <div className="text-sm text-center mt-[29px]">
        <span>Already have an Account?</span>
        <span
          className="text-[#FF7F50] font-bold cursor-pointer ml-1"
          onClick={() => navigate('/login')}
        >
          Log In
        </span>
      </div>
    </form>
  );
}

// Main login page component
export default function Registration() {
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