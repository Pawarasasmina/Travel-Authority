import * as React from "react";
import { useForm } from "react-hook-form";
import bgImage from "../assets/background-login.jpg";

interface ChangePasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

// Change Password Form component
function ChangePasswordForm() {
  const { register, handleSubmit } = useForm<ChangePasswordFormData>();

  const onSubmit = (data: ChangePasswordFormData) => {
    if (data.newPassword === data.confirmPassword) {
      console.log("Password changed successfully:", data.newPassword);
    } else {
      console.error("Passwords do not match!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[327px]">
      <div className="text-[36px] font-bold text-center mb-[29px] max-sm:text-[32px]">
        Change Password
      </div>
      <div className="flex flex-col gap-4 mb-8 max-sm:gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="newPassword" className="text-[15px] text-black font-semibold">
            Enter New Password
          </label>
          <div className="flex items-center gap-4 border h-[50px] bg-white px-4 py-2 rounded-lg border-solid border-[#E0E0E0] shadow-[0_4px_6px_rgba(0,0,0,0.1)] max-sm:h-[45px]">
            <input
              id="newPassword"
              type="password"
              placeholder="Enter New Password"
              {...register("newPassword")}
              className="w-full text-[15px] text-black border-[none] focus:outline-none bg-transparent"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-[15px] text-black font-semibold">
            Confirm Password
          </label>
          <div className="flex items-center gap-4 border h-[50px] bg-white px-4 py-2 rounded-lg border-solid border-[#E0E0E0] shadow-[0_4px_6px_rgba(0,0,0,0.1)] max-sm:h-[45px]">
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              className="w-full text-[15px] text-black border-[none] focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="w-full h-[60px] text-white text-lg font-semibold cursor-pointer shadow-[0_4px_4px_rgba(0,0,0,0.25),0_1px_1px_rgba(0,0,0,0.25)_inset] rounded-[20px] border-none bg-gradient-to-r from-[#FF7F50] to-[#BF360C] max-sm:h-[50px] mt-16"
      >
        Save
      </button>
    </form>
  );
}

// Main Change Password page component
export default function ChangePassword() {
  return (
    <div
      className="flex justify-center items-center min-h-screen bg-neutral-100 p-4 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-white opacity-40"></div> {/* Overlay */}
      <div className="flex w-full max-w-[1100px] scale-[0.85] shadow-md bg-white rounded-[20px] max-md:flex-col max-md:max-w-[500px] max-sm:rounded-md relative">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/45bbe1598e1eb471892256d1ee93adaff5876552"
          alt="Mountain lake view from wooden boat"
          className="w-3/5 object-cover h-[700px] rounded-l-[20px] max-md:w-full max-md:h-[150px] max-md:rounded-t-lg"
        />
        <div className="w-2/5 flex flex-col items-center px-4 py-16 max-md:w-full max-md:px-3 max-md:py-10">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
