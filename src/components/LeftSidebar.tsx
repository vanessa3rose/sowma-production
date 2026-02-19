import { useClerk, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";

import logo from "../assets/logo-cropped.png";
import facebook from "../assets/facebook.jpg";
import google from "../assets/google.jpg";
import instagram from "../assets/instagram.jpg";
import linkedin from "../assets/linkedin.jpg";
import twitter from "../assets/twitter.jpg";
import tiktok from "../assets/tiktok.jpg";
import newsletter from "../assets/newsletter.jpg";

type Role = "ADMIN" | "USER" | "VIEWER";

const socialLinks = [
  { slug: "google", label: "Google", icon: google },
  { slug: "instagram", label: "Instagram", icon: instagram },
  { slug: "facebook", label: "Facebook", icon: facebook },
  { slug: "tiktok", label: "TikTok", icon: tiktok },
  { slug: "linkedin", label: "LinkedIn", icon: linkedin },
  { slug: "twitter", label: "Twitter/X", icon: twitter },
  { slug: "newsletter", label: "Newsletter", icon: newsletter },
];

const exceptionRoutes: Record<string, string> = {
  google: "/social/google-analytics",
  linkedin: "/error/linkedin",
  tiktok: "/error/tiktok",
  newsletter: "/newsletter",
};

const LeftSidebar = ({
  mobile = false,
  open = false,
  collapsed = true,
  onCollapse = () => {},
  onClose = () => {},
}: {
  mobile?: boolean;
  open?: boolean;
  collapsed?: boolean;
  onCollapse?: (value: boolean) => void;
  onClose?: () => void;
}) => {
  const { signOut } = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();
  const [role, setRole] = useState<Role | null>(null);

  const [location] = useLocation();

  const isDashboardActive = location === "/" || location === "/homepage";
  const isGlossaryActive = location === "/glossary";
  const isAdminActive = location === "/admin";

  // Only change needed for this branch: show Admin button for ADMIN users
  // Role must be fetched via backend (/api/users), not from Clerk metadata on the frontend.
  useEffect(() => {
    let cancelled = false;

    async function fetchRoleByEmail(email: string) {
      try {
        const resp = await fetch(
          `/api/users?email=${encodeURIComponent(email)}`,
        );
        const json = await resp.json();
        const fetchedRole =
          (json?.data?.[0]?.role as Role | undefined) ?? "VIEWER";
        if (!cancelled) setRole(fetchedRole);
      } catch {
        if (!cancelled) setRole("VIEWER");
      }
    }

    if (!isLoaded) return;

    if (!isSignedIn) {
      setRole(null);
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      setRole("VIEWER");
      return;
    }

    fetchRoleByEmail(email);

    return () => {
      cancelled = true;
    };
  }, [user, isLoaded, isSignedIn]);

  const sidebarClasses = mobile
    ? `fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 overflow-y-scroll no-scrollbar
       transform transition-transform duration-300 p-4 border-r border-gray-100 pl-12
       ${open ? "translate-x-0" : "-translate-x-full"}`
    : `fixed top-6 left-4 h-[calc(100vh-24px)] bg-white z-50 transition-all duration-300 
       shadow-[0px_6px_16px_0px_rgba(0,0,0,0.25)]
       rounded-xl border-gray-100 flex flex-col 
       ${collapsed ? "w-20" : "w-64"}`;

  const handleSignOut = async () => {
    await signOut();
    window.location.replace("/login");
  };

  return (
    <>
      {mobile && open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <div className={sidebarClasses}>
        {/* HEADER: Removed min-height and fixed spacer to remove the "white box" effect */}
        <div
          className={`flex items-center ${collapsed && !mobile ? "justify-center" : "justify-between"} p-4 w-full`}
        >
          {!collapsed || mobile ? (
            <img
              src={logo}
              alt="Logo"
              className="w-4/5 h-auto object-contain transition-all"
            />
          ) : null}

          {!mobile && (
            <button
              onClick={() => onCollapse(!collapsed)}
              className="w-6 h-6 border-2 border-[#A1A1A1] flex items-center justify-center 
                         text-[#A1A1A1] hover:bg-gray-100 transition rounded-sm bg-white shrink-0"
            >
              <span
                className={`transform transition-transform ${collapsed && !mobile ? "rotate-180" : ""}`}
              >
                &lt;
              </span>
            </button>
          )}
        </div>

        {/* NAVIGATION */}
        <nav
          className={`flex-1 flex flex-col px-3 overflow-y-auto overflow-x-hidden no-scrollbar
          ${collapsed && !mobile ? "items-center space-y-4" : "items-start space-y-1"}
        `}
        >
          {/* Dashboard */}
          <Link href="/" className="w-full">
            <div
              className={`flex flex-row items-center transition-all
                ${
                  collapsed && !mobile
                    ? "w-12 h-12 justify-center rounded-xl mx-auto"
                    : "w-full gap-x-4 p-2 rounded-xl"
                }
                ${isDashboardActive ? "bg-[#4781C2] text-white shadow-md" : "hover:bg-gray-100 text-[#000000]"}
              `}
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
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
              </div>
              {(!collapsed || mobile) && (
                <p className="font-poppins text-[18px] font-medium whitespace-nowrap">
                  Dashboard
                </p>
              )}
            </div>
          </Link>

          {/* Glossary */}
          <Link href="/glossary" className="w-full">
            <div
              className={`flex flex-row items-center transition-all
                ${
                  collapsed && !mobile
                    ? "w-12 h-12 justify-center rounded-xl mx-auto"
                    : "w-full gap-x-4 p-2 rounded-xl"
                }
                ${isGlossaryActive ? "bg-[#4781C2] text-white shadow-md" : "hover:bg-gray-100 text-[#000000]"}
              `}
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
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
              </div>
              {(!collapsed || mobile) && (
                <p className="font-poppins text-[18px] font-medium whitespace-nowrap">
                  Glossary
                </p>
              )}
            </div>
          </Link>

          {/* Admin (ADMIN users only) */}
          {role === "ADMIN" && (
            <Link href="/admin" className="w-full">
              <div
                className={`flex flex-row items-center transition-all
                  ${
                    collapsed && !mobile
                      ? "w-12 h-12 justify-center rounded-xl mx-auto"
                      : "w-full gap-x-4 p-2 rounded-xl"
                  }
                  ${
                    isAdminActive
                      ? "bg-[#4781C2] text-white shadow-md"
                      : "hover:bg-gray-100 text-[#000000]"
                  }
                `}
              >
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  {/* Gear icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                    <path d="M12.5 17C10 17 8 15 8 12.5C8 10 10 8 12.5 8C15 8 17 10 17 12.5C17 15 15 17 12.5 17ZM12.5 9C10.55 9 9 10.55 9 12.5C9 14.45 10.55 16 12.5 16C14.45 16 16 14.45 16 12.5C16 10.55 14.45 9 12.5 9Z" fill="black"/>
                    <path d="M13.85 22H11.15L10.4 19.7C9.9 19.55 9.4 19.35 8.95 19.1L6.75 20.2L4.85 18.3L5.95 16.1C5.7 15.65 5.5 15.15 5.35 14.65L3 13.85V11.15L5.3 10.4C5.45 9.9 5.65 9.4 5.9 8.95L4.8 6.75L6.7 4.85L8.9 5.95C9.35 5.7 9.85 5.5 10.35 5.35L11.15 3H13.85L14.6 5.3C15.1 5.45 15.6 5.65 16.05 5.9L18.25 4.8L20.15 6.7L19.05 8.9C19.3 9.35 19.5 9.85 19.65 10.35L21.95 11.1V13.8L19.65 14.55C19.5 15.05 19.3 15.55 19.05 16L20.15 18.2L18.25 20.1L16.05 19C15.6 19.25 15.1 19.45 14.6 19.6L13.85 22ZM11.85 21H13.15L13.85 18.85L14.1 18.8C14.7 18.65 15.25 18.4 15.8 18.1L16.05 17.95L18.05 18.95L18.95 18.05L17.95 16.05L18.1 15.8C18.4 15.3 18.65 14.7 18.8 14.1L18.85 13.85L21 13.15V11.85L18.85 11.15L18.8 10.9C18.65 10.3 18.4 9.75 18.1 9.2L17.95 8.95L18.95 6.95L18.05 6.05L16.05 7.05L15.8 6.9C15.25 6.6 14.7 6.35 14.1 6.2L13.85 6.15L13.15 4H11.85L11.15 6.15L10.9 6.2C10.3 6.35 9.75 6.6 9.2 6.9L8.95 7.05L6.95 6.05L6.05 6.95L7.05 8.95L6.9 9.2C6.6 9.7 6.35 10.3 6.2 10.9L6.15 11.15L4 11.85V13.15L6.15 13.85L6.2 14.1C6.35 14.7 6.6 15.25 6.9 15.8L7.05 16.05L6.05 18.05L6.95 18.95L8.95 17.95L9.2 18.1C9.75 18.4 10.3 18.65 10.9 18.8L11.15 18.85L11.85 21Z" fill="black"/>
                  </svg>
                </div>
                {(!collapsed || mobile) && (
                  <p className="font-poppins text-[18px] font-medium whitespace-nowrap">
                    Admin
                  </p>
                )}
              </div>
            </Link>
          )}

          {/* PLATFORMS */}
          <div className="flex flex-col space-y-1 w-full pt-2">
            {(!collapsed || mobile) && (
              <h1 className="font-poppins font-medium text-[14px] text-[#A1A1A1] tracking-widest px-3 pb-1 uppercase">
                Platforms
              </h1>
            )}
            {collapsed && !mobile && (
              <div className="w-8 border-t border-gray-100 my-2 mx-auto" />
            )}

            {socialLinks.map((social, idx) => {
              const href =
                exceptionRoutes[social.slug] || `/social/${social.slug}`;
              const isActive = location === href;

              return (
                <Link href={href} key={idx} className="w-full">
                  <div
                    className={`relative flex items-center rounded-xl transition-all
                      ${collapsed && !mobile ? "w-12 h-12 justify-center mx-auto" : "w-full gap-4 p-2"}
                      ${isActive ? "bg-[#F0F0F0] text-black shadow-sm" : "hover:bg-gray-100"}
                    `}
                  >
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      <img
                        src={social.icon}
                        alt={social.label}
                        className="w-full h-full object-contain rounded-[8px] bg-white p-1"
                      />
                    </div>
                    {(!collapsed || mobile) && (
                      <p className="font-poppins font-medium text-[16px] whitespace-nowrap">
                        {social.label}
                      </p>
                    )}
                    {isActive && (
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#4781C2] rounded-r-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Sign Out */}
          <div className="mt-auto pb-6 pt-4 flex justify-center w-full">
            <button
              onClick={handleSignOut}
              className={`flex items-center rounded-xl transition-all
                ${collapsed && !mobile ? "w-12 h-12 justify-center" : "w-full gap-3 px-3 py-2"}
                text-[#626262] hover:text-red-700 hover:bg-gray-50`}
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3"
                  />
                </svg>
              </div>
              {(!collapsed || mobile) && (
                <span className="text-[16px] font-medium whitespace-nowrap">
                  Sign Out
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default LeftSidebar;
