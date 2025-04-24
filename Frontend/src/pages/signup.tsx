// signup.tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layouts/AuthLayout';

interface RegistrationFormData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nic: string;
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
          id="firstName"
          type="text"
          placeholder="First Name"
          label="First Name"
          {...register("firstName")}
        />
        <Input
          id="lastName"
          type="text"
          placeholder="Last Name"
          label="Last Name"
          {...register("lastName")}
        />
        <Input
          id="email"
          type="email"
          placeholder="Email"
          label="Email"
          {...register("email")}
        />
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="Phone Number"
          label="Phone Number"
          {...register("phoneNumber")}
        />
        <Input
          id="nic"
          type="text"
          placeholder="NIC number"
          label="NIC Number"
          {...register("nic")}
        />
      </div>
      <Button 
        type="submit"
        fullWidth 
        onClick={() => navigate('/signup2')}
      >
        Next
      </Button>
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

// Main registration page component
export default function Registration() {
  return (
    <AuthLayout imagePosition="right">
      <RegistrationForm />
    </AuthLayout>
  );
}