import LoginPanel from "../components/login/Login";
import login from "../assets/login-picture.png";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-white">
      <div className="flex w-full h-full justify-center items-center">
        {/* login */}
        <div className="flex-1 justify-center items-center z-10">
          <LoginPanel />
        </div>

        {/* image */}
        <div className="h-screen flex justify-center items-center overflow-hidden">
          <img src={login} alt="login" className="h-full w-full object-cover" />
        </div>
      </div>
    </main>
  );
}
