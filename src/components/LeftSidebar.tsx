import { useClerk, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";

import logo from "../assets/logo-cropped.png";
import facebook from "../assets/facebook.jpg";
import googleAnalytics from "../assets/google-analytics.png";
import instagram from "../assets/instagram.jpg";
import linkedin from "../assets/linkedin.jpg";
import twitter from "../assets/twitter.jpg";
import constantContact from "../assets/newsletter.jpg";

type Role = "ADMIN" | "USER" | "VIEWER";

const socialLinks = [
  {
    slug: "google-analytics",
    label: "Google Analytics",
    icon: googleAnalytics,
  },
  { slug: "instagram", label: "Instagram", icon: instagram },
  { slug: "facebook", label: "Facebook", icon: facebook },
  { slug: "linkedin", label: "LinkedIn", icon: linkedin },
  { slug: "twitter", label: "Twitter/X", icon: twitter },
  {
    slug: "constant-contact",
    label: "Constant Contact",
    icon: constantContact,
  },
];

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

  // show Admin button for ADMIN users

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setRole(null);
      return;
    }

    const clerkRole = user?.publicMetadata?.role as Role | undefined;

    // Fail closed
    setRole(clerkRole ?? "VIEWER");
  }, [isLoaded, isSignedIn, user]);

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
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
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
              const href = `/social/${social.slug}`;
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
                        className="w-8 h-8 object-cover rounded-[8px]"
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
