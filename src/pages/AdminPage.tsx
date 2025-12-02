import { useState, useEffect } from "react";
import { ROLE_PERMISSIONS } from "../data/rolePermissions";
import { Switch } from "@mui/material";

export default function AdminPage() {
  const [rolePerm, setRolePerm] = useState(ROLE_PERMISSIONS);

  const permissions = [
    "Browse All Pages",
    "Change Data Range",
    "Export Charts",
    "Choose Metrics On Page",
    "Tag Events/One-Off Events",
    "Invite/Remove Viewers",
  ] as const;

  const roles = ["Admin", "Intern"] as const;

  const handleToggle = (role: "Admin" | "Intern", perm: string) => {
    setRolePerm((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm],
      },
    }));
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
      <div className="flex flex-row my-6 w-full pl-12">
        <div className="w-1/3 font-poppins text-lg text-gray-500 font-light">Permissions</div>
        <div className="w-1/3 font-poppins text-lg text-gray-500 font-thin text-center">Admin</div>
        <div className="w-1/3 font-poppins text-lg text-gray-500 font-thin text-center">Intern</div>
      </div>

      {/* ROWS */}
      <div className="flex flex-col space-y-6 pl-12 md:space-y-4">
        {permissions.map((permission, index) => (
          <div key={index} className="flex flex-rowborder-b-2">
            {/* permission */}
            <div className="w-1/3">
              <p className="flex items-center h-full font-poppins text-lg">{permission}</p>
            </div>

            {/* toggles - admin & intern */}
            {roles.map((role) => (
              <div key={role} className="w-1/3 flex justify-center items-center">
                <div className="relative block w-11 h-6">
                  <input
                    id={`switch-${role}-${permission}`}
                    type="checkbox"
                    checked={rolePerm[role][permission]}
                    onChange={() => handleToggle(role, permission)}
                    className="peer appearance-none w-11 h-6 rounded-full cursor-pointer transition-colors duration-300 bg-[#D9D9D9] checked:bg-sowma-blue"
                  />

                  <label
                    htmlFor={`switch-${role}-${permission}`}
                    className="absolute top-0.5 left-[2px] w-5 h-5 bg-white rounded-full border shadow-sm cursor-pointer transition-transform duration-300 border-slate-300 peer-checked:translate-x-6 peer-checked:left-[-2px] peer-checked:border-sowma-blue "
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
