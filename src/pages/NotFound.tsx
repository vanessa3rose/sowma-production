import { useLocation } from "wouter";

const NotFoundPage = () => {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-6 font-poppins">
      <p className="text-8xl font-bold text-[#4781C2] select-none">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-gray-800">Page Not Found</h1>
      <p className="mt-2 text-gray-500 text-sm max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-sm rounded-lg bg-[#4781C2] text-white hover:bg-gray-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;