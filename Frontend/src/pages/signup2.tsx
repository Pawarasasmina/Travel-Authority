// login.tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layouts/AuthLayout';

interface RegistrationFormData {
  password: string;
  confirmPassword: string;
}

// Registration Form component
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
        <Input
          id="password"
          type="password"
          placeholder="Password"
          label="Password"
          {...register("password")}
        />
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          label="Confirm Password"
          {...register("confirmPassword")}
        />
      </div>
      <Button
        type="submit"
        fullWidth
      >
        Register
      </Button>
    </form>
  );
}

// Main registration page component
export default function Registration2() {
  return (
    <AuthLayout imagePosition="right">
      <RegistrationForm />
    </AuthLayout>
  );
}