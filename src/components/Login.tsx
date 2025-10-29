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
            type="password"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                width="24"
                height="24"
              >
                <g clipPath="url(#clip0_596_276)">
                  <path
                    d="M3.42885 11.1429C2.71456 11.1429 2.10742 10.8929 1.60742 10.3929C1.10742 9.89286 0.857422 9.28571 0.857422 8.57143C0.857422 7.85714 1.10742 7.25 1.60742 6.75C2.10742 6.25 2.71456 6 3.42885 6C4.14314 6 4.75028 6.25 5.25028 6.75C5.75028 7.25 6.00028 7.85714 6.00028 8.57143C6.00028 9.28571 5.75028 9.89286 5.25028 10.3929C4.75028 10.8929 4.14314 11.1429 3.42885 11.1429ZM1.71456 16.2857V14.5714H18.8574V16.2857H1.71456ZM10.286 11.1429C9.57171 11.1429 8.96456 10.8929 8.46456 10.3929C7.96456 9.89286 7.71456 9.28571 7.71456 8.57143C7.71456 7.85714 7.96456 7.25 8.46456 6.75C8.96456 6.25 9.57171 6 10.286 6C11.0003 6 11.6074 6.25 12.1074 6.75C12.6074 7.25 12.8574 7.85714 12.8574 8.57143C12.8574 9.28571 12.6074 9.89286 12.1074 10.3929C11.6074 10.8929 11.0003 11.1429 10.286 11.1429ZM17.1431 11.1429C16.4289 11.1429 15.8217 10.8929 15.3217 10.3929C14.8217 9.89286 14.5717 9.28571 14.5717 8.57143C14.5717 7.85714 14.8217 7.25 15.3217 6.75C15.8217 6.25 16.4289 6 17.1431 6C17.8574 6 18.4646 6.25 18.9646 6.75C19.4646 7.25 19.7146 7.85714 19.7146 8.57143C19.7146 9.28571 19.4646 9.89286 18.9646 10.3929C18.4646 10.8929 17.8574 11.1429 17.1431 11.1429Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_596_276">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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
            Don’t have an account?
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
