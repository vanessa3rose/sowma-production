import login from "../assets/login-picture.png";
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-white">
      <div className="flex w-full h-full justify-center items-center">
        {/* LEFT SIDE */}
        <div className="flex flex-col flex-1 w-full justify-start items-center gap-10 pt-10">
          {/* Header */}
          <div className="max-w-full flex flex-col items-center">
            <h1 className="text-center font-poppins text-[40px] leading-[60px] font-medium text-black">
              Welcome to the
              <br />
              <span className="font-bold text-[40px] leading-[60px] text-[#4781C2]">
                SOWMA Analytics Dashboard
              </span>
            </h1>
          </div>

          {/* Sign In */}
          <div className="max-w-full flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full mx-auto !important",
                  card: "w-full p-10 rounded-2xl shadow-2xl border border-gray-200",
                  formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-white",
                },
              }}
            />
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="h-screen flex justify-center items-center overflow-hidden">
          <img src={login} alt="login" className="h-full w-full object-cover" />
        </div>
      </div>
    </main>
  );
}
