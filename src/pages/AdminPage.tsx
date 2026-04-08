import { useState } from "react";
import APIData from "../components/admin-tabs/APIData";
import UsersRoles from "../components/admin-tabs/UsersRoles";
import Waitlist from "../components/admin-tabs/Waitlist";

const tabs = ["API and Data", "Users and Roles", "Waitlist"] as const;
type Tab = (typeof tabs)[number];

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<Tab>("API and Data");

  const tabContent: Record<Tab, JSX.Element> = {
    "Users and Roles": <UsersRoles />,
    "API and Data": <APIData />,
    Waitlist: <Waitlist />,
  };

  return (
    <div className="ml-6 px-5 pb-5 pt-8 lg:pt-10">
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
      <div className="my-6">
        <div className="flex justify-evenly items-center">
          {tabs.map((tab) => {
            const isSelected = tab === selectedTab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`font-poppins font-bold leading-6 transition-colors lg:px-5 py-1.5 rounded-full px-8 lg:text-[24px] text-[20px] ${
                  isSelected
                    ? "bg-sowma-light-blue text-white"
                    : "text-gray-500 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <div className="mt-2 h-[2px] bg-sowma-light-blue" />
      </div>

      {/* ROWS */}
      <div>{tabContent[selectedTab]}</div>
    </div>
  );
}
