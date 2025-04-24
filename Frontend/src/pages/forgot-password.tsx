import * as React from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import bgImage from "../assets/login-signup/background-login.jpg";

interface ForgotPasswordFormData {
  email: string;
  code: string[];
}

// Forgot Password Form component
function ForgotPasswordForm() {
  const { register, handleSubmit } = useForm<ForgotPasswordFormData>();
  const [isCodeSent, setIsCodeSent] = useState(false);

  const onSubmit = (data: ForgotPasswordFormData) => {
    if (!isCodeSent) {
      console.log("Code sent to:", data.email);
      setIsCodeSent(true);
    } else {
      console.log("Code entered:", data.code);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[327px]">
      <div className="text-[40px] font-bold text-center mb-[29px] max-sm:text-[32px]">
        Forgot Password
      </div>
      <div className="flex flex-col gap-4 mb-8 max-sm:gap-3">
        {!isCodeSent && (
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-[15px] text-black font-semibold">
              Email or Phone Number
            </label>
            <div className="flex items-center gap-4 border h-[55px] bg-white px-4 py-2 rounded-[10px] border-solid border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] max-sm:h-[50px]">
              <input
                id="email"
                type="text"
                placeholder="Enter Email or Phone Number"
                {...register("email")}
                className="w-full text-[15px] text-black border-[none] focus:outline-none bg-transparent"
              />
            </div>
          </div>
        )}
        {isCodeSent && (
          <div className="flex flex-col gap-1">
            <label htmlFor="code" className="text-[15px] text-black font-semibold">
              Enter Code
            </label>
            <div className="flex gap-2 justify-center">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    {...register(`code.${index}`)}
                    className="w-10 h-14 text-center text-[15px] text-black border border-[#E0E0E0] rounded-[10px] focus:outline-none shadow-[0_2px_4px_rgba(0,0,0,0.1)] bg-transparent"
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.value.length === 1) {
                        const nextSibling = target.nextElementSibling as HTMLInputElement;
                        if (nextSibling) {
                          nextSibling.focus();
                        }
                      }
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full h-[60px] text-white text-lg font-semibold cursor-pointer shadow-[0_4px_4px_rgba(0,0,0,0.25),0_1px_1px_rgba(0,0,0,0.25)_inset] rounded-[20px] border-none bg-gradient-to-r from-[#FF7F50] to-[#BF360C] max-sm:h-[50px] mt-16"
      >
        {isCodeSent ? "Verify" : "Send Code"}
      </button>
    </form>
  );
}

// Main Forgot Password page component
export default function ForgotPassword() {
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
        <div className="w-2/5 flex flex-col items-center px-4 py-16 max-md:w-full max-md:px-3 max-md:py-10"> {/* Increased padding */}
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
