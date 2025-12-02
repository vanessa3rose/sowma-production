export default function GlossaryPage() {

        
        //   return <div className="font-poppins font-medium text-[20px]"> NOTE: this was the original div definition
        return (
        <div className="w-full min-h-screen lg:h-full bg-white flex flex-col gap-4">
                <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
                        <div className="flex items-center space-x-2">
                                {/* back button */}
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
                                {/* Page title */}
                                <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">Glossary</h1>
                        </div>

                </div>

                {/* glossary contents */}
                <div className="flex flex-col lg:flex-row gap-4 px-4 lg:h-full">
                        <h1 className="font-poppins">Refer to the glossary below for defintions of common terminology used throughout the dashboard</h1>
                </div>

        </div>
        );
}

// grey
// thin
// medium