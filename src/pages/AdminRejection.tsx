import { useLocation } from "wouter";

export default function AdminRejection() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-[600px] rounded-2xl bg-white p-8 sm:p-12 lg:p-16 text-center shadow-lg">
        <h1 className="mb-8 sm:mb-10 text-2xl sm:text-3xl lg:text-4xl font-semibold text-black">
          You do not have permission to access this content.
        </h1>

        <button
          onClick={() => setLocation("/")}
          className="w-full sm:w-auto rounded-full bg-[#4781C2] px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl text-white shadow hover:bg-[#3b6ea6] transition"
        >
          Redirect to homepage
        </button>
      </div>
    </div>
  );
}