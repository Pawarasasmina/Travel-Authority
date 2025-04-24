import * as React from "react";
import { useForm } from "react-hook-form";
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLayout from '../components/layouts/AuthLayout';

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
        <Input
          id="newPassword"
          type="password"
          placeholder="Enter New Password"
          label="Enter New Password"
          {...register("newPassword")}
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
        className="mt-16"
      >
        Save
      </Button>
    </form>
  );
}

// Main Change Password page component
export default function ChangePassword() {
  return (
    <AuthLayout imagePosition="left">
      <ChangePasswordForm />
    </AuthLayout>
  );
}
