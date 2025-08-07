import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import SuccessModal from '../components/ui/SuccessModal';
import AuthLayout from '../components/layouts/AuthLayout';
import * as authApi from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { debugLog } from '../utils/debug';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Change Password Form component
function ChangePasswordForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordFormData>();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const handleCancel = () => {
    navigate(-1); // Navigate back to the previous page
  };
  const onSubmit = async (data: ChangePasswordFormData) => {
    // Reset error message
    setErrorMessage(null);
    
    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      setErrorMessage("New passwords do not match!");
      return;
    }
    
    // Basic password strength validation
    if (data.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setIsLoading(true);
      debugLog('CHANGE_PASSWORD', 'Submitting password change', { currentPassword: '***', newPassword: '***' });
      
      const response = await authApi.changePassword(data.currentPassword, data.newPassword);
      debugLog('CHANGE_PASSWORD', 'Change password response', response);
      
      if (response.status === "OK" || response.status === "200 OK") {
        // Show success modal
        setShowSuccessModal(true);
        reset(); // Clear form
      } else {
        setErrorMessage(response.message || "Failed to change password. Please try again.");
      }
    } catch (error: any) {
      debugLog('CHANGE_PASSWORD', 'Error changing password', error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An error occurred while changing your password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[327px]">
      <div className="text-[36px] font-bold text-center mb-[29px] max-sm:text-[32px]">
        Change Password
      </div>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      
      <div className="flex flex-col gap-4 mb-8 max-sm:gap-3">
        <Input
          id="currentPassword"
          type="password"
          placeholder="Current Password"
          label="Current Password"
          {...register("currentPassword", { required: "Current password is required" })}
        />
        {errors.currentPassword && (
          <span className="text-red-500 text-xs">{errors.currentPassword.message}</span>
        )}
        
        <Input
          id="newPassword"
          type="password"
          placeholder="Enter New Password"
          label="New Password"
          {...register("newPassword", { 
            required: "New password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long"
            }
          })}
        />
        {errors.newPassword && (
          <span className="text-red-500 text-xs">{errors.newPassword.message}</span>
        )}
        
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm New Password"
          label="Confirm New Password"
          {...register("confirmPassword", { 
            required: "Please confirm your new password"
          })}
        />
        {errors.confirmPassword && (
          <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? "Changing Password..." : "Save Changes"}
        </Button>
        
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Password Changed"
        message="Your password has been successfully updated."
        buttonText="Return to Login"
        onClose={() => {
          logout(); // Log the user out after successful password change
        }}
        onButtonClick={() => {
          logout(); // Log the user out after successful password change
        }}
      />
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
