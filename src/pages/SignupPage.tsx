import { useState } from "react";
import LoginTextBox from "../components/login/LoginTextBox";
import SignupPicture from "../assets/Signup-picture.png";

// this function is called when the sign up button is pressed
async function submitSignUp(FormData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}) {
  try {
    const res = await fetch("http://localhost:4000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(FormData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Signup failed");
    }

    console.log("User created:", data.data);
  } catch (err) {
    console.error("Signup error:", err);
  }
}

export default function LoginPanel() {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setname] = useState("");
  const [lastName, setlastName] = useState("");
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isNameEmpty, setIsNameEmpty] = useState(false);
  const [islastNameEmpty, setislastNameEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setrole] = useState("Intern");
  // Event handlers
  const handleLogin = () => {
    setEmailNotFound(false);
    const emailEmpty = email.trim().length === 0;
    const passEmpty = password.trim().length === 0;
    const nameEmpty = firstName.trim().length == 0;
    const lastNameEmpty = lastName.trim().length == 0;
    setIsEmailEmpty(emailEmpty);
    setIsPasswordEmpty(passEmpty);
    setIsNameEmpty(nameEmpty);
    setislastNameEmpty(lastNameEmpty);
    if (emailEmpty || passEmpty || nameEmpty || lastNameEmpty) {
      console.log("Validation failed — empty fields");
      if (emailEmpty) {
        console.log("Validation failed - empty email field");
      }
      if (passEmpty) {
        console.log("Validation failed - empty password field");
      }
      if (nameEmpty) {
        console.log("Validation failed - empty name field");
      }
      if (lastNameEmpty) {
        console.log("Validation failed - empty name field");
      }
      return;
    }
  };
  return (
    <section className="flex w-full flex-col md:flex-row min-h-[780px] bg-white">
      <div className="flex flex-col items-center md:items-start justify-center w-full md:w-1/2 px-6 md:px-12 py-10 gap-6">
        {/* Header */}
        <h1 className="text-center md:text-left font-poppins text-[40px] leading-[60px] font-medium text-[#000000]">
          Sign up for the
          <br />
          <span className="font-poppins font-bold text-[40px] leading-[60px] text-[#4781C2]">
            SOWMA Analytics Dashboard
          </span>
        </h1>
        {/* Signup form */}
        <form
          className="flex flex-col w-full max-w-[580px] gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          {/* Name Fields Side by Side */}
          <div className="flex gap-7">
            {/* First Name Field */}
            <div className="flex flex-col flex-1 gap-1">
              <LoginTextBox
                label="First Name:"
                placeholder=""
                type="name"
                value={firstName}
                onChange={(e) => setname(e.target.value)}
                width="w-60"
              />
              {isNameEmpty && (
                <p className="text-red-600 text-sm font-poppins">
                  First name cannot be empty.
                </p>
              )}
            </div>
            {/* Last Name Field */}
            <div className="flex flex-col flex-1 gap-1">
              <LoginTextBox
                label="Last Name:"
                placeholder=""
                type="name"
                value={lastName}
                onChange={(e) => setlastName(e.target.value)}
                width="w-60"
              />
              {islastNameEmpty && (
                <p className="text-red-600 text-sm font-poppins">
                  Last name cannot be empty.
                </p>
              )}
            </div>
          </div>
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
          </div>

          {/* Desired Access Field */}
          <LoginTextBox label="Desired Level of Access:">
            <button
              type="button"
              className={`flex-1 mx-2 py-2 rounded-full font-semibold text-[20px] transition-colors ${
                role === "Admin"
                  ? "bg-[#4781C2] text-white"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
              onClick={() => setrole("Admin")}
            >
              Admin
            </button>
            <button
              type="button"
              className={`flex-1 mx-2 py-2 rounded-full font-semibold text-[20px] transition-colors ${
                role === "Intern"
                  ? "bg-[#4781C2] text-white"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
              onClick={() => setrole("Intern")}
            >
              Intern
            </button>
          </LoginTextBox>

          {/* Login button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-[332px] h-[76px] rounded-[30px] bg-[#0077B6] hover:bg-[#00679E] transition text-white font-poppins font-bold text-[26px]"
              onClick={() =>
                submitSignUp({
                  email,
                  password,
                  firstName,
                  lastName,
                  role,
                })
              }
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
      <div className="w-full md:w-1/2 h-[500px] md:h-auto">
        <img
          src={SignupPicture}
          alt="Illustration for the signup page"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}
