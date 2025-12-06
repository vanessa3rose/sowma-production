import SignupPicture from "../assets/Signup-picture.png";
import { SignUp } from "@clerk/clerk-react";

export default function SignupPage() {
  return (
    <section className="flex flex-col lg:flex-row h-screen items-center justify-center bg-white -mx-6">
      {/* LEFT SIDE */}
      <div
        className="
          flex flex-col
          justify-center
          items-center
          w-full lg:w-1/2
          h-full
          px-6 lg:px-12
          pt-10 lg:pt-10
          gap-10
        "
      >
        {/* Header */}
        <div className="w-full mx-auto gap-10 flex flex-col items-center justify-center">
            <div className="w-full flex flex-col items-center">
            <h1
                className="
                text-center
                font-poppins
                text-xl sm:text-2xl lg:text-5xl 
                leading-normal sm:leading-normal lg:leading-[60px]
                font-medium
                text-black
                "
            >
                Sign up for the
                <br />
                <span className="font-bold text-[#4781C2] whitespace-normal">
                SOWMA Analytics Dashboard
                </span>
            </h1>
            </div>

            {/* SignUp Form */}
            <div className="">
              <SignUp
                appearance={{
                  elements: {
                    rootBox: "max-w-full",
                    card: "w-full p-8 rounded-xl shadow-md border border-gray-200",
                  },
                }}
              />
            </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 h-full hidden lg:block">
        <img
          src={SignupPicture}
          alt="Signup illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}