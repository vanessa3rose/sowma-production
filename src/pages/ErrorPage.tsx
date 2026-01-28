export default function ErrorPage() {
  return (
    <div className="p-5">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => (window.location.href = "/")}
          className="w-[40px] h-[40px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <div className="font-poppins font-medium text-[20px]">
          This social media page is not connected yet but will be soon.
        </div>
      </div>
    </div>
  );
}
