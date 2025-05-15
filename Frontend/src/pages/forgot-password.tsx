import * as React from "react";
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { useState } from "react";
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layouts/AuthLayout';

interface ForgotPasswordFormData {
  email: string;
  code: string[];
}

// Forgot Password Form component
function ForgotPasswordForm() {
  const { register, handleSubmit } = useForm<ForgotPasswordFormData>();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (data: ForgotPasswordFormData) => {
    if (!isCodeSent) {
      console.log("Code sent to:", data.email);
      setIsCodeSent(true);
    } else {
      
      onclick=() => navigate('/change-password')
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[327px]">
      <div className="text-[40px] font-bold text-center mb-[29px] max-sm:text-[32px]">
        Forgot Password
      </div>
      <div className="flex flex-col gap-4 mb-8 max-sm:gap-3">
        {!isCodeSent && (
          <Input
            id="email"
            type="text"
            placeholder="Enter Email or Phone Number"
            label="Email or Phone Number"
            {...register("email")}
          />
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
      <Button
        type="submit"
        fullWidth
        className="mt-16"
      >
        {isCodeSent ? "Verify" : "Send Code"}
      </Button>
    </form>
  );
}

// Main Forgot Password page component
export default function ForgotPassword() {
  return (
    <AuthLayout imagePosition="left">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
