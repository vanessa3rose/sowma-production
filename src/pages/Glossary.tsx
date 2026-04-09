import { Link } from "wouter";
import { GLOSSARY_ITEMS } from "../data/glossarydata.tsx";
import { COLORS } from "../data/colors.js";

export default function GlossaryPage() {
  const platformRoutes: Record<string, string> = {
    "Google Analytics": "/social/google-analytics",
    Facebook: "/social/facebook",
    Instagram: "/social/instagram",
    Twitter: "/social/twitter",
    "Constant Contact": "/social/constant-contact",
  };

  const platformColors: Record<string, string> = {
    "Google Analytics": COLORS.SOWMA_GREEN,
    Facebook: COLORS.SOWMA_FACEBOOK,
    Instagram: COLORS.SOWMA_INSTAGRAM,
    Twitter: COLORS.SOWMA_TWITTER,
    LinkedIn: COLORS.SOWMA_LINKEDIN,
    "Constant Contact": COLORS.SOWMA_CONSTANT_CONTACT,
  };

  return (
    <div className="w-full min-h-screen gap-4 px-4 bg-white flex flex-col pb-2 pt-4 lg:pt-6 font-poppins">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center">
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
          <h1 className="font-semibold text-3xl lg:text-4xl">Glossary</h1>
        </div>
      </div>

      {/* Glossary Table */}
      <div className="px-4 sm:px-16 py-6">
        <p className="text-lg text-gray-500 mb-8">
          Refer to the glossary below for definitions of common terminology used
          throughout the dashboard
        </p>

        {/* Header Row */}
        <div className="hidden sm:grid sm:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] gap-9 pb-2 underline text-gray-500 text-xl">
          <h3>Term</h3>
          <h3>Definition</h3>
        </div>

        {/* Rows */}
        {/* finds a term in the glossary data/defintions and returns the defintion and 
           platform */}
        <div className="flex flex-col space-y-6">
          {[...GLOSSARY_ITEMS]
            .sort((a: any, b: any) => a.key.localeCompare(b.key))
            .map((item: any) => (
              <div
                key={item.key}
                className="grid grid-cols-1 sm:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] border-b border-black pb-6 gap-y-2 gap-x-8 items-start"
              >
                {/* Term */}
                <p className="text-xl lg:md:whitespace-nowrap px-2">
                  {item.term}
                </p>

                {/* Definition */}
                <div className="text-lg">
                  <p className="break-words">{item.definition}</p>

                  {item.platforms && item.platforms.length > 0 && (
                    <div className="mt-2">
                      <span className="font-semibold text-sm text-gray-800">
                        Platforms:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.platforms.map((platform: any, index: any) => (
                          <Link
                            key={index}
                            href={platformRoutes[platform]}
                            className="text-sm px-4 py-1.5 rounded-full font-medium whitespace-nowrap"
                            style={{
                              backgroundColor: `${platformColors[platform] ?? COLORS.SOWMA_MEDIUM_GRAY}26`,
                              color:
                                platformColors[platform] ??
                                COLORS.SOWMA_MEDIUM_GRAY,
                            }}
                          >
                            {platform}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* How We Retrieve Data */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">How We Retrieve Data</h2>
          <div className="text-lg text-black space-y-3">
            <p>
              Our dashboard retrieves data directly from the platforms you
              connect using secure API keys, which work like passwords for your
              data. Refresh tokens keep these connections active, so your
              metrics update automatically without requiring you to log in
              repeatedly.
            </p>
            <p>
              We ensure your data stays accurate and up to date. Additionally,
              if any issues occur such as expired credentials or temporary
              platform errors, the dashboard displays clear messages while
              automatically handling reconnections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
