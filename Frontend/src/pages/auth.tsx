import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/background-login.jpg";
import styles from "../styles/Auth.module.css";

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<AuthFormData>();

  const handleToggle = () => {
    setIsRegistering(!isRegistering);
  };

  const onSubmit = (data: AuthFormData) => {
    console.log(data);
    if (isRegistering) {
      // Registration logic
      console.log("Registering:", data);
    } else {
      // Login logic
      console.log("Logging in:", data);
    }
  };

  return (
    <div
      className={`${styles["auth-page"]} flex justify-center items-center min-h-screen bg-neutral-100 p-4 relative`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`${styles["container"]} ${isRegistering ? styles.active : ""}`}>
        {/* Left Section: Login/Signup Form */}
        <div className={`${styles["form-container"]} ${isRegistering ? styles.hidden : ""}`}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1>Sign In</h1>
            <div className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                required
                className={styles["input-field"]}
              />
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                required
                className={styles["input-field"]}
              />
            </div>
            <button type="submit" className={styles["btn-primary"]}>Sign In</button>
            <p className="text-sm mt-4">
              Don't have an account?{" "}
              <span className={styles["text-link"]} onClick={handleToggle}>
                Sign Up
              </span>
            </p>
          </form>
        </div>

        {/* Right Section: Toggle Panels */}
        <div className={styles["toggle-container"]}>
          <div className={styles["toggle"]}>
            <div className={`${styles["toggle-panel"]} ${styles["toggle-left"]}`}>
              <h1>Welcome Back!</h1>
              <p>To keep connected, please login with your personal info</p>
              <button onClick={handleToggle} className={styles["btn-secondary"]}>Sign In</button>
            </div>
            <div className={`${styles["toggle-panel"]} ${styles["toggle-right"]}`}>
              <h1>Hello, Friend!</h1>
              <p>Enter your details to start your journey with us</p>
              <button onClick={handleToggle} className={styles["btn-secondary"]}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
