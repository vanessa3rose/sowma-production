import { useClerk } from "@clerk/clerk-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";

import logo from "../assets/logo-cropped.png";
import facebook from "../assets/facebook.jpg";
import google from "../assets/google.jpg";
import instagram from "../assets/instagram.jpg";
import linkedin from "../assets/linkedin.jpg";
import twitter from "../assets/twitter.jpg";
import tiktok from "../assets/tiktok.jpg";
import newsletter from "../assets/newsletter.jpg";

const socialLinks = [
  { slug: "google", label: "Google", icon: google }, // exception
  { slug: "instagram", label: "Instagram", icon: instagram },
  { slug: "facebook", label: "Facebook", icon: facebook },
  { slug: "tiktok", label: "TikTok", icon: tiktok }, // exception
  { slug: "linkedin", label: "LinkedIn", icon: linkedin }, // exception
  { slug: "twitter", label: "Twitter/X", icon: twitter },
  { slug: "newsletter", label: "Newsletter", icon: newsletter },
];

const exceptionRoutes: Record<string, string> = {
  google: "/google-analytics",
  linkedin: "/error",
  tiktok: "/error",
  newsletter: "/newsletter",
};


const LeftSidebar = ({ mobile = false, open = false, onClose = () => {} }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useClerk();
  const [location] = useLocation();

  const isDashboardActive = location === "/";
  const isGlossaryActive = location === "/glossary";
  

  const sidebarClasses = mobile
  ? `fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50
     transform transition-transform duration-300 p-4 border-r border-gray-100 pl-12
     ${open ? "translate-x-0" : "-translate-x-full"}`
  : `fixed top-6 left-4 h-full bg-white z-50 transition-all duration-300 
      shadow-[0px_6px_16px_0px_rgba(0,0,0,0.25)]
      rounded-xl border-gray-100
     ${collapsed ? "w-20" : "w-1/5"} p-4 flex flex-col items-center`;

  const handleSignOut = async () => {
    await signOut();
    window.location.replace("/login"); // Wouter-friendly redirect
  };

  return (
    <>
      {/* Overlay for mobile */}
      {mobile && open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <div className={sidebarClasses}>
        {/* Collapse Arrow */}
        {!mobile && (
            <div
              className={`flex w-full
                ${collapsed ? "justify-center py-4" : "justify-end"}
              `}
            >
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-6 h-6 border-2 border-[#A1A1A1]
                          flex items-center justify-center
                          text-[#A1A1A1] hover:bg-gray-100
                          transition rounded-sm"
              >
                <span
                  className={`transform transition-transform ${
                    collapsed ? "rotate-180" : ""
                  }`}
                  >
                &lt;
              </span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav
          className={`relative flex flex-col px-1 transition-all 
          flex-1 min-h-0
            ${collapsed ? "w-full items-center gap-3" : "w-4/5 items-start space-y-3"}
          `}
        >
        
        {/* logo */}
        {!collapsed && (
          <img
          src={logo}
          alt="Logo"
          className="object-contain mx-auto transition-all p-2"/>
        )}
        

        <Link href="/" className="w-full flex justify-center">
          <div
            className={`flex items-center rounded-xl transition-all
              ${collapsed
                ? "w-12 h-12 justify-center"
                : "w-full gap-x-4 p-3"}
              ${isDashboardActive
                ? "bg-[#4781C2] text-white shadow-lg"
                : "hover:bg-gray-100"}
            `}
          >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {!collapsed && (
                <p className="md:hidden lg:block font-poppins text-[20px] font-medium">
                  Dashboard
                </p>
              )}
            </div>
          </Link>

          <Link href="/glossary" className="w-full">
            <div className={`flex flex-row items-center gap-x-4 p-3 rounded-xl transition-all
            ${collapsed ? "justify-center" : "gap-x-4"}
              ${isGlossaryActive 
                ? "bg-[#4781C2] text-white shadow-lg" 
                : "bg-transparent hover:bg-gray-100"}
            `}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
              {!collapsed && (
                <p className="md:hidden lg:block font-poppins text-[20px] font-medium">
                  Glossary
                </p>
              )}
            </div>
          </Link>

          {/* Socials */}
          <div className="flex flex-col space-y-3">
            {collapsed ? (
              <div className="md:hidden w-8 border-t border-gray-300 my-3 mx-auto" />
            ) : (
              <h1 className="font-poppins font-medium text-[20px] text-[#626262]">
                PLATFORMS
              </h1>
            )}

            {socialLinks.map((social, idx) => {
              const href =
                exceptionRoutes[social.slug] || `/social/${social.slug}`; // fallback to default
                const isActive = location === href;

              return (
                <Link
                  href={href}
                  key={idx}
                  className={`relative flex items-center p-2 rounded-xl transition-all duration-200
                    ${collapsed ? "justify-center w-12 mx-auto" : "gap-4 w-full"}
                    ${isActive
                      ? "bg-[#F0F0F0] text-black shadow-lg"
                      : "bg-transparent hover:bg-gray-100"
                    }
                  `}
                >
                  <img
                    src={social.icon}
                    alt={social.label}
                    className="w-9 h-9 object-contain rounded-[10px] bg-white p-1 shrink-0"
                  />
                  {/* The Blue Indicator Bar */}
                  {isActive && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-4/5 bg-[#4781C2] rounded-full" />
                  )}
                  {!collapsed && (
                    <p className="md:hidden lg:block font-poppins font-medium text-[20px]">
                      {social.label}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sign Out */}
          <div className="mt-auto pb-8 flex justify-center w-full">

            <button
              onClick={handleSignOut}
              className={`flex items-center rounded-xl transition-all
                ${collapsed ? "w-12 h-12 justify-center" : "gap-3 px-3 py-2"}
                text-[#626262] hover:text-red-800 hover:bg-gray-100`}
            >

          <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 shrink-0"
              >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3"
              />
            </svg>

              {!collapsed && <span className="md:hidden lg:block text-[18px]">Sign Out</span>}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};
export default LeftSidebar;
