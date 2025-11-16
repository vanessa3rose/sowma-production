import { useState, useEffect } from "react";
import { ROLE_PERMISSIONS } from "../data/rolePermissions";
import { Switch } from "@mui/material";

export default function AdminPage() {
  const [rolePerm, setRolePerm] = useState(ROLE_PERMISSIONS);

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
      <div className="mt-6 grid grid-cols-[minmax(120px,1fr),minmax(80px,1fr),minmax(80px,1fr)] mb-4">
        <div className="text-gray-500 font-medium">Permissions</div>
        <div className="text-gray-500 font-medium text-center">Admin</div>
        <div className="text-gray-500 font-medium text-center">Intern</div>
      </div>

      {/* ROWS */}
      <div className="grid grid-cols-[minmax(120px,1fr),minmax(80px,1fr),minmax(80px,1fr)] gap-y-2">
        {/* ROW 1 */}
        <div className="text-lg">Browse all pages</div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Admin["Browse all pages"]}
            onChange={() => handleToggle("Admin", "Browse all pages")}
          />
        </div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Intern["Browse all pages"]}
            onChange={() => handleToggle("Intern", "Browse all pages")}
          />
        </div>

        {/* ROW 2 */}
        <div className="text-lg">Change Date Range</div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Admin["Change Date Range"]}
            onChange={() => handleToggle("Admin", "Change Date Range")}
          />
        </div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Intern["Change Date Range"]}
            onChange={() => handleToggle("Intern", "Change Date Range")}
          />
        </div>

        {/* ROW 3 */}
        <div className="text-lg">Export charts</div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Admin["Export charts"]}
            onChange={() => handleToggle("Admin", "Export charts")}
          />
        </div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Intern["Export charts"]}
            onChange={() => handleToggle("Intern", "Export charts")}
          />
        </div>

        {/* ROW 4 */}
        <div className="text-lg">Choose metrics on page</div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Admin["Choose metrics on page"]}
            onChange={() => handleToggle("Admin", "Choose metrics on page")}
          />
        </div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Intern["Choose metrics on page"]}
            onChange={() => handleToggle("Intern", "Choose metrics on page")}
          />
        </div>

        {/* ROW 5 */}
        <div className="text-lg">Tag events/one-off events</div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Admin["Tag events/one-off events "]}
            onChange={() => handleToggle("Admin", "Tag events/one-off events")}
          />
        </div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Intern["Tag events/one-off events "]}
            onChange={() => handleToggle("Intern", "Tag events/one-off events")}
          />
        </div>

        {/* ROW 6 */}
        <div className="text-lg">Invite/Remove viewers</div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Admin["Invite/Remove viewers"]}
            onChange={() => handleToggle("Admin", "Invite/Remove viewers")}
          />
        </div>

        <div className="flex justify-center">
          <Switch
            checked={rolePerm.Intern["Invite/Remove viewers"]}
            onChange={() => handleToggle("Intern", "Invite/Remove viewers")}
          />
        </div>
      </div>
    </div>
  );
}
