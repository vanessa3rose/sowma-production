import logo from "../assets/logo.png";
import { useClerk } from "@clerk/clerk-react";

const LeftSidebar = () => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    window.location.replace("/login"); // Wouter-friendly redirect
  };

  return (
    <div className="fixed top-0 left-0 flex flex-col w-1/5 h-full items-center bg-white border-r border-gray-600 p-4 z-50">

      {/* Logo */}
      <img
        src={logo}
        alt="Logo"
        className="sm:w-full lg:w-4/5 aspect-square object-contain m-2"
      />

      {/* Navigation */}
      <nav className="flex flex-col w-4/5 items-start space-y-3 px-1">
        <a href="/">
          <div className="bg-light-gray flex flex-row items-center gap-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <p className="hidden lg:block font-poppins text-[20px] font-medium">
              Dashboard
            </p>
          </div>
        </a>

        <a href="/admin">
          <div className="bg-light-gray flex flex-row items-center gap-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
            <p className="hidden lg:block font-poppins text-[20px] font-medium">
              Admin
            </p>
          </div>
        </a>

        <a href="/glossary">
          <div className="bg-light-gray flex flex-row items-center gap-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            <p className="hidden lg:block font-poppins text-[20px] font-medium">
              Glossary
            </p>
          </div>
        </a>
      </nav>

      {/* Sign Out */}
      <div className="mt-auto w-full flex justify-center pb-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 text-red-600 font-medium hover:text-red-800 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3"
            />
          </svg>

          <span className="hidden lg:block text-[18px]">Sign Out</span>
        </button>
      </div>

    </div>
  );
};

export default LeftSidebar;
