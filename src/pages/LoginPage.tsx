import login from "../assets/login-picture.png";
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <section className="flex flex-col lg:flex-row h-screen items-center justify-center bg-white -mr-6">
        {/* LEFT SIDE */}
        <div className="flex flex-col flex-1 w-full justify-center items-center gap-10 h-full pr-6">
          {/* Header */}
        <div className="w-full gap-10 flex flex-col items-center justify-center py-6">
          <div className="w-full flex flex-col items-center">
            <h1 className="text-center
                font-poppins
                text-xl sm:text-3xl lg:text-5xl 
                leading-normal sm:leading-normal lg:leading-[60px]
                font-medium
                text-black">
              Welcome to the
              <br />
              <span className="font-bold text-[#4781C2] whitespace-normal">
                SOWMA Analytics Dashboard
              </span>
            </h1>
          </div>

          {/* Sign In */}
          <div className="">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "max-w-full",
                  card: "w-full p-8 rounded-2xl shadow-md border border-gray-200",
                  formButtonPrimary: "hover:bg-sowma-blue text-white",
                },
              }}
            />
          </div>
        </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="w-full lg:w-1/2 h-full hidden lg:block">
          <img src={login} alt="login" className="h-full w-full object-cover" />
        </div>
    </section>
  );
}
