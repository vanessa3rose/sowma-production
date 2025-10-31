import { useState } from "react";
import LoginTextBox from "./LoginTextBox";

export default function LoginPanel() {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Event handlers
  const handleLogin = () => {
    setEmailNotFound(false);
    setWrongPassword(false);

    const emailEmpty = email.trim().length === 0;
    const passEmpty = password.trim().length === 0;

    setIsEmailEmpty(emailEmpty);
    setIsPasswordEmpty(passEmpty);

    console.log("[Login clicked]", { email, password });

    if (emailEmpty || passEmpty) {
      console.log("Validation failed — empty fields");
      if (emailEmpty) {
        console.log("Validation failed - empty email field");
      }
      if (passEmpty) {
        console.log("Validation failed - empty password field");
      }
      return;
    }
  };

  const handleForgotPassword = () => {
    console.log("[Forgot Password clicked]");
  };

  const handleSignup = () => {
    console.log("[Sign Up clicked]");
  };

  return (
    <section className="flex flex-col items-center w-[592px] min-h-[740px] gap-6">
      {/* Header */}
      <h1 className="text-center font-poppins text-[40px] leading-[60px] font-medium text-[#000000]">
        Welcome to the
        <br />
        <span className="font-poppins font-bold text-[40px] leading-[60px] text-[#4781C2]">
          SOWMA Analytics Dashboard
        </span>
      </h1>

      {/* Login form */}
      <form
        className="flex flex-col w-[577px] gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <LoginTextBox
            label="Email:"
            placeholder="someone@gmail.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                width="24"
                height="24"
              >
                <path
                  d="M4.00049 20C3.45049 20 2.97982 19.8043 2.58849 19.413C2.19715 19.0217 2.00115 18.5507 2.00049 18V6C2.00049 5.45 2.19649 4.97933 2.58849 4.588C2.98049 4.19667 3.45115 4.00067 4.00049 4H20.0005C20.5505 4 21.0215 4.196 21.4135 4.588C21.8055 4.98 22.0012 5.45067 22.0005 6V18C22.0005 18.55 21.8048 19.021 21.4135 19.413C21.0222 19.805 20.5512 20.0007 20.0005 20H4.00049ZM12.0005 13L20.0005 8V6L12.0005 11L4.00049 6V8L12.0005 13Z"
                  fill="black"
                />
              </svg>
            }
          />
          {isEmailEmpty && (
            <p className="text-red-600 text-sm font-poppins">
              Email cannot be empty.
            </p>
          )}
          {emailNotFound && (
            <p className="text-red-600 text-sm font-poppins">
              Email not found.
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <LoginTextBox
            label="Password:"
            placeholder="••••••••••"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={
              <button // hide/show password
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="focus:outline-none"
                aria-label={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.21 16.058 7 19 12 19c1.727 0 3.36-.37 4.822-1.035M6.228 6.228A10.45 10.45 0 0112 5c5 0 8.79 2.942 10.066 7a10.48 10.48 0 01-4.132 5.033M6.228 6.228L3 3m3.228 3.228L21 21"
                    />
                  </svg>
                )}
              </button>
            }
          />
          {isPasswordEmpty && (
            <p className="text-red-600 text-sm font-poppins">
              Password cannot be empty.
            </p>
          )}
          {wrongPassword && (
            <p className="text-red-600 text-sm font-poppins">
              Incorrect password.
            </p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="font-poppins text-[20px] text-[#0077B6] underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-[332px] h-[76px] rounded-[30px] bg-[#0077B6] hover:bg-[#00679E] transition text-white font-poppins font-bold text-[26px]"
          >
            Login
          </button>
        </div>

        {/* Sign up row */}
        <div className="flex justify-center items-center gap-2">
          <p className="font-poppins text-[20px] text-[#7B7C7C]">
            Don't have an account?
          </p>
          <button
            type="button"
            onClick={handleSignup}
            className="font-poppins text-[20px] text-[#4781C2] underline"
          >
            Sign Up
          </button>
        </div>
      </form>
    </section>
  );
}
