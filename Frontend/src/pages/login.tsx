// login.tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/background-login.jpg'; 

interface LoginFormData {
  email: string;
  password: string;
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

// Social Login component
function SocialLogin() {
  return (
    <div className="w-full max-w-[327px]">
      <Divider className="mx-0 my-[29px]">or</Divider>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 text-sm text-black cursor-pointer shadow-[0_4px_4px_rgba(0,0,0,0.25)] bg-[#EEE] p-[18px] rounded-lg border-[none] max-sm:p-[15px]"
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_1_43)">
            <path
              d="M20.4894 10.6871C20.4894 9.86767 20.4214 9.26973 20.2741 8.64966H10.6992V12.348H16.3194C16.2062 13.2671 15.5943 14.6512 14.2345 15.5813L14.2154 15.7051L17.2429 17.9969L17.4526 18.0174C19.3789 16.2789 20.4894 13.721 20.4894 10.6871"
              fill="#4285F4"
            />
            <path
              d="M10.6991 20.4314C13.4526 20.4314 15.7642 19.5455 17.4526 18.0175L14.2345 15.5814C13.3733 16.1682 12.2175 16.5779 10.6991 16.5779C8.0023 16.5779 5.7134 14.8395 4.89747 12.4367L4.77787 12.4466L1.62991 14.8273L1.58875 14.9392C3.26576 18.1946 6.71048 20.4314 10.6991 20.4314Z"
              fill="#34A853"
            />
            <path
              d="M4.8976 12.4367C4.68231 11.8166 4.55771 11.1522 4.55771 10.4657C4.55771 9.77915 4.68231 9.11479 4.88627 8.49472L4.88057 8.36266L1.69316 5.94373L1.58888 5.9922C0.897698 7.34311 0.501099 8.86014 0.501099 10.4657C0.501099 12.0713 0.897698 13.5882 1.58888 14.9391L4.8976 12.4367"
              fill="#FBBC05"
            />
            <path
              d="M10.6991 4.35336C12.6141 4.35336 13.9058 5.16168 14.6424 5.83718L17.5205 3.09107C15.7529 1.4855 13.4526 0.5 10.6991 0.5C6.71048 0.5 3.26576 2.73672 1.58875 5.99214L4.88614 8.49466C5.7134 6.09183 8.0023 4.35336 10.6991 4.35336"
              fill="#EB4335"
            />
          </g>
          <defs>
            <clipPath id="clip0_1_43">
              <rect
                width="20"
                height="20"
                fill="white"
                transform="translate(0.5 0.5)"
              />
            </clipPath>
          </defs>
        </svg>
        <span>Continue with Google</span>
      </button>
      <div className="text-xs text-black text-center mt-8">
        Terms of Service and Privacy Policy
      </div>
    </div>
  );
}

// Login Form component
function LoginForm() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {

    console.log(data);
    navigate('/aboutus')
    
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[327px]">
      <div className="text-[44px] font-bold text-center mb-[29px] max-sm:text-[32px]">
        Log In
      </div>
      <div className="flex flex-col gap-4 mb-8 max-sm:gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-[15px] text-black">
            Email
          </label>
          <div className="flex items-center gap-4 border h-[55px] bg-white px-4 py-2 rounded-[10px] border-solid border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] max-sm:h-[50px]">
            <div>
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.87866 5.37868C3.44127 4.81607 4.20433 4.5 4.99998 4.5H19C19.7956 4.5 20.5587 4.81607 21.1213 5.37868C21.6839 5.94129 22 6.70435 22 7.5V8.48448C22.0001 8.49422 22.0001 8.50395 22 8.51368V17.5C22 18.2957 21.6839 19.0587 21.1213 19.6213C20.5587 20.1839 19.7956 20.5 19 20.5H4.99998C4.20433 20.5 3.44127 20.1839 2.87866 19.6213C2.31605 19.0587 1.99998 18.2956 1.99998 17.5V8.51367C1.99984 8.50395 1.99984 8.49422 1.99998 8.48449V7.5C1.99998 6.70435 2.31605 5.94129 2.87866 5.37868ZM3.99998 10.3685V17.5C3.99998 17.7652 4.10534 18.0196 4.29288 18.2071C4.48041 18.3946 4.73477 18.5 4.99998 18.5H19C19.2652 18.5 19.5196 18.3946 19.7071 18.2071C19.8946 18.0196 20 17.7652 20 17.5V10.3685L13.665 14.5919C13.6649 14.5919 13.6648 14.592 13.6647 14.5921C13.1718 14.9208 12.5925 15.0963 12 15.0963C11.4075 15.0963 10.8282 14.9208 10.3353 14.5921C10.3352 14.592 10.3351 14.5919 10.335 14.5919L3.99998 10.3685ZM20 7.96482L12.5553 12.9279L12.555 12.9282C12.3907 13.0378 12.1975 13.0963 12 13.0963C11.8024 13.0963 11.6093 13.0378 11.445 12.9282L11.4447 12.9279L3.99998 7.96482V7.5C3.99998 7.23478 4.10534 6.98043 4.29288 6.79289C4.48041 6.60536 4.73477 6.5 4.99998 6.5H19C19.2652 6.5 19.5196 6.60536 19.7071 6.79289C19.8946 6.98043 20 7.23478 20 7.5V7.96482Z"
                  fill="black"
                />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full text-[15px] text-black border-[none] focus:outline-none bg-transparent"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-[15px] text-black">
            Password
          </label>
          <div className="flex items-center gap-4 border h-[55px] bg-white px-4 py-2 rounded-[10px] border-solid border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] max-sm:h-[50px]">
            <div>
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 8.5H20C20.2652 8.5 20.5196 8.60536 20.7071 8.79289C20.8946 8.98043 21 9.23478 21 9.5V21.5C21 21.7652 20.8946 22.0196 20.7071 22.2071C20.5196 22.3946 20.2652 22.5 20 22.5H4C3.73478 22.5 3.48043 22.3946 3.29289 22.2071C3.10536 22.0196 3 21.7652 3 21.5V9.5C3 9.23478 3.10536 8.98043 3.29289 8.79289C3.48043 8.60536 3.73478 8.5 4 8.5H6V7.5C6 5.9087 6.63214 4.38258 7.75736 3.25736C8.88258 2.13214 10.4087 1.5 12 1.5C13.5913 1.5 15.1174 2.13214 16.2426 3.25736C17.3679 4.38258 18 5.9087 18 7.5V8.5ZM5 10.5V20.5H19V10.5H5ZM11 14.5H13V16.5H11V14.5ZM7 14.5H9V16.5H7V14.5ZM15 14.5H17V16.5H15V14.5ZM16 8.5V7.5C16 6.43913 15.5786 5.42172 14.8284 4.67157C14.0783 3.92143 13.0609 3.5 12 3.5C10.9391 3.5 9.92172 3.92143 9.17157 4.67157C8.42143 5.42172 8 6.43913 8 7.5V8.5H16Z"
                  fill="black"
                />
              </svg>
            </div>
            <input
              id="password"
              type="password"
              placeholder="Password"
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
  Log In
</button>

      <div
        className="text-sm text-black text-center cursor-pointer mt-[29px]"
        onClick={() => navigate('/forgot-password')} // Navigate to forgot-password
      >
        Forget Password
      </div>
      <div className="text-sm text-center mt-[29px]">
        <span>Don't have a account ?</span>
        <span className="text-[#FF7F50] font-bold cursor-pointer ml-1"  onClick={() => navigate('/signup')}>
          Register
          
        </span>
      </div>
    </form>
  );
}

// Main login page component
export default function Login() {
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
        <div className="w-2/5 flex flex-col items-center px-4 py-6 max-md:w-full max-md:px-3 max-md:py-4">
          <LoginForm />
          <SocialLogin />
        </div>
      </div>
    </div>
  );
}