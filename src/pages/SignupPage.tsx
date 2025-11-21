import SignupPicture from "../assets/Signup-picture.png";
import { SignUp } from "@clerk/clerk-react";

export default function LoginPanel() {
  return (
<<<<<<< HEAD
    <section className="flex w-full flex-col md:flex-row min-h-[780px] md:min-h-[780px] bg-white">
      <div className="flex flex-col items-center md:items-start justify-center w-full md:w-1/2 px-6 md:px-12 py-10 gap-6">
=======
    <section className="flex w-full flex-col md:flex-row min-h-[780px] bg-white">

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

>>>>>>> 0c9abb0 (inserted clerk components & changed some frontend styling)
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
            Welcome to the
            <br />
            <span className="font-bold text-[40px] leading-[60px] text-[#4781C2]">
              SOWMA Analytics Dashboard
            </span>
          </h1>
        </div>

        {/* SignUp Form */}
        <div className="ml-20"> 
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-[520px] max-w-full",
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
