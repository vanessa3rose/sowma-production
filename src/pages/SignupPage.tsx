import SignupPicture from "../assets/Signup-picture.png";
import { SignUp } from "@clerk/clerk-react";

export default function LoginPanel() {
  return (
    <section className="flex w-full flex-col md:flex-row h-screen items-center bg-white">
      {/* LEFT SIDE */}
      <div
        className="
          flex flex-col
          justify-start
          items-center
          w-full md:w-1/2
          px-6 md:px-12
          pt-10
          gap-10
        "
      >
        {/* Header */}
        <div className="w-[520px] max-w-full flex flex-col items-center">
          <h1
            className="
              text-center
              font-poppins
              text-[40px]
              leading-[60px]
              font-medium
              text-black
            "
          >
            Sign up for the
            <br />
            <span className="font-bold text-[40px] leading-[60px] text-[#4781C2] whitespace-nowrap">
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

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 h-[500px] md:h-auto">
        <img
          src={SignupPicture}
          alt="Signup illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}
