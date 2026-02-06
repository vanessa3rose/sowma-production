import { useClerk } from "@clerk/clerk-react";

import logo from "../assets/logo.png";
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
  google: "/social/google-analytics",
  linkedin: "/error",
  tiktok: "/error",
  newsletter: "/newsletter",
};

const LeftSidebar = ({ mobile = false, open = false, onClose = () => {} }) => {
  const sidebarClasses = mobile
    ? `fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50
       transform transition-transform duration-300 p-4 border-r border-gray-600 pl-12
       ${open ? "translate-x-0" : "-translate-x-full"}`
    : "fixed top-0 left-0 flex flex-col w-1/5 space-y-5 h-full items-center bg-white border-r border-gray-600 p-4 z-50";

  const { signOut } = useClerk();

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
              <p className="md:hidden lg:block font-poppins text-[20px] font-medium">
                Dashboard
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
              <p className="md:hidden lg:block font-poppins text-[20px] font-medium">
                Glossary
              </p>
            </div>
          </a>

          {/* Socials */}
          <div className="flex flex-col space-y-3 w-full">
            <h1 className="font-poppins font-medium text-[20px] text-[#626262]">
              PLATFORMS
            </h1>
            {socialLinks.map((social, idx) => {
              const href =
                exceptionRoutes[social.slug] || `/social/${social.slug}`; // fallback to default

              return (
                <a href={href} key={idx} className="flex items-center gap-4">
                  <img
                    src={social.icon}
                    alt={social.label}
                    className="w-10 h-10 hover:opacity-80 transition rounded-[10px] border border-solid"
                  />
                  <p className="md:hidden lg:block font-poppins font-medium text-[20px]">
                    {social.label}
                  </p>
                </a>
              );
            })}
          </div>

          {/* Sign Out */}
          <div
            className={`absolute bottom-0 pb-8 justify-center flex ${mobile ? "pl-6" : "w-full"}`}
          >
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 text-[#626262] font-medium hover:text-red-800 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3"
              />

              <span className="md:hidden lg:block text-[18px]">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};
export default LeftSidebar;
