import login from "../assets/login-picture.png";
import { SignIn } from '@clerk/clerk-react';

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-white">
      <div className="flex w-full h-full justify-center items-center">
        {/* login */}
        <div className="flex flex-1 w-full justify-center items-center z-10">
          <SignIn
          appearance={{
            elements: {
              card: "shadow-2xl p-10 rounded-2xl w-[520px] max-w-full",
              formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-white",
            },
          }}
       />
        </div>

        {/* image */}
        <div className="h-screen flex justify-center items-center overflow-hidden">
          <img src={login} alt="login" className="h-full w-full object-cover" />
        </div>
      </div>

    </main>
  );
}
