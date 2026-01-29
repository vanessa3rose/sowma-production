import { useState } from "react";
import APIData from "../components/admin-tabs/APIData";
import UsersRoles from "../components/admin-tabs/UsersRoles";
import Waitlist from "../components/admin-tabs/Waitlist";

const tabs = ["Users and Roles", "API and Data", "Waitlist"] as const;
type Tab = (typeof tabs)[number];

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<Tab>("Users and Roles");

  const tabContent: Record<Tab, JSX.Element> = {
    "Users and Roles": <UsersRoles />,
    "API and Data": <APIData />,
    Waitlist: <Waitlist />,
  };

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
        <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
          Admin
        </h1>
      </div>

      {/* HEADER */}
      <div className="pl-12 my-6">
        <div className="flex items-center gap-10">
          {tabs.map((tab) => {
            const isSelected = tab === selectedTab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`font-poppins font-bold text-2xl leading-[48px] transition-colors px-5 py-1 rounded-full ${
                  isSelected
                    ? "bg-[#4e8bcc] text-white"
                    : "text-gray-500 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <div className="mt-2 h-[2px] bg-[#4e8bcc]" />
      </div>

      {/* ROWS */}
      <div className="pl-12">{tabContent[selectedTab]}</div>
    </div>
  );
}
