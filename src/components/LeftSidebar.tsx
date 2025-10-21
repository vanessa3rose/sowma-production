import logo from "../assets/logo.png";

const LeftSidebar = () => {
  return (
    <div className="fixed top-0 left-0 flex flex-col w-1/5 space-y-5 h-full items-center border-r border-gray-600 p-10 gap-4 z-50">
      <img src={logo} alt="Logo" className="w-4/5" />

      <div className="flex flex-col w-4/5 justify-start space-y-3">
        <div className="h-30 w-30  bg-light-gray flex flex-row  gap-x-4">
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
          <p className="h-23 w-123 font-poppins font-medium text-[20px] leading-snug tracking-normal align-middle">
            {" "}
            Dashboard{" "}
          </p>
        </div>

        <div className="h-30 w-30 bg-light-gray flex flex-row  gap-x-4">
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
          <p className="h-23 w-123 font-poppins font-medium text-[20px] leading-snug tracking-normal align-middle gap-[3.75]">
            {" "}
            Admin{" "}
          </p>
        </div>

        <div className="h-30 w-30 bg-light-gray flex flex-row gap-x-4">
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
          <p className="h-23 w-123 font-poppins font-medium text-[20px] leading-snug tracking-normal align-middle gap-[3.75]">
            {" "}
            Glossary{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
