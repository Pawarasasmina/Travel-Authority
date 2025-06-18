// signup.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import SuccessModal from '../components/ui/SuccessModal';
import AuthLayout from '../components/layouts/AuthLayout';
import * as authApi from '../api/authApi';
import { debugLog } from '../utils/debug';
import { useAuth } from '../hooks/useAuth';

interface RegistrationFormData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nic: string;
  password: string;
  confirmPassword: string;
}

// Registration Form component
function RegistrationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm<RegistrationFormData>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Redirect already authenticated users to home
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      debugLog('REGISTER', 'User already authenticated, redirecting to home');
      navigate('/home');
    }
  }, [isAuthenticated, authLoading, navigate]);
    const onSubmit = async (data: RegistrationFormData) => {
    if (step === 1) {
      debugLog('REGISTER', 'Moving to step 2 of registration');
      setStep(2);
    } else {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        debugLog('REGISTER', 'Submitting registration data', data);
        
        const response = await authApi.register(data);
        debugLog('REGISTER', 'Registration response', response);        // Check for various success response formats
        if (response.status === "CREATED" || 
            response.status === "OK" || 
            response.status === "200 OK" || 
            response.status === "201 CREATED") {
          debugLog('REGISTER', 'Registration successful, showing success modal');
          
          // Reset the form and show success modal
          reset();
          setStep(1);
          setShowSuccessModal(true);
          
          // Navigation will be handled by modal button click
        } else {
          debugLog('REGISTER', 'Registration failed', response.message);
          setErrorMessage(response.message || "Registration failed. Please try again.");
        }} catch (error: any) {
        debugLog('REGISTER', 'Registration error', error);
        
        // Extract error message for better user feedback
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.message) {
          setErrorMessage(`Registration error: ${error.message}`);
        } else {
          setErrorMessage("An error occurred during registration. Please try again.");
        }
        
        console.error("Registration error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[327px]">
      <div className="text-[44px] font-bold text-center mb-[29px] max-sm:text-[32px]">
        Register
      </div>
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-col gap-3 mb-8 max-sm:gap-2">
        {step === 1 ? (
          <>
            <Input
              id="firstName"
              type="text"
              placeholder="First Name"
              label="First Name"
              {...register("firstName", { required: "First name is required" })}
            />
            {errors.firstName && (
              <span className="text-red-500 text-xs">{errors.firstName.message}</span>
            )}
            
            <Input
              id="lastName"
              type="text"
              placeholder="Last Name"
              label="Last Name"
              {...register("lastName", { required: "Last name is required" })}
            />
            {errors.lastName && (
              <span className="text-red-500 text-xs">{errors.lastName.message}</span>
            )}
            
            <Input
              id="email"
              type="email"
              placeholder="Email"
              label="Email"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && (
              <span className="text-red-500 text-xs">{errors.email.message}</span>
            )}
            
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Phone Number"
              label="Phone Number"
              {...register("phoneNumber", { 
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Phone number should contain only digits"
                }
              })}
            />
            {errors.phoneNumber && (
              <span className="text-red-500 text-xs">{errors.phoneNumber.message}</span>
            )}
            
            <Input
              id="nic"
              type="text"
              placeholder="NIC number"
              label="NIC Number"
              {...register("nic", { required: "NIC number is required" })}
            />
            {errors.nic && (
              <span className="text-red-500 text-xs">{errors.nic.message}</span>
            )}
          </>
        ) : (
          <>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              label="Password"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long"
                }
              })}
            />
            {errors.password && (
              <span className="text-red-500 text-xs">{errors.password.message}</span>
            )}
            
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              label="Confirm Password"
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: value => value === getValues("password") || "Passwords do not match"
              })}
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>
            )}
          </>
        )}
      </div>      <Button type="submit" fullWidth disabled={isLoading}>
        {step === 1 ? "Next" : isLoading ? "Registering..." : "Register"}
      </Button>
      
      {/* Back button on step 2 */}
      {step === 2 && (
        <button
          type="button"
          className="mt-4 text-sm text-center w-full text-gray-600"
          onClick={() => setStep(1)}
        >
          Back to previous step
        </button>
      )}
      
      <div className="text-sm text-center mt-[29px]">
        <span>Already have an account?</span>
        <span 
          className="text-[#FF7F50] font-bold cursor-pointer ml-1"  
          onClick={() => navigate('/login')}
        >
          Log In
        </span>      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Registration Successful!"
        message="Your account has been created successfully. You can now log in to access your account."
        buttonText="Go to Login"
        onClose={() => navigate('/login')}
        onButtonClick={() => navigate('/login')}
      />
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