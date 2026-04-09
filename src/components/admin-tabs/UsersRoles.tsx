import { useEffect, useState } from "react";
import Dropdown from "../Dropdown";

const roles = ["ADMIN", "USER", "VIEWER"] as Role[];
type Role = "ADMIN" | "USER" | "VIEWER";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export default function UsersRoles() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  // ---------------- FETCH USERS ----------------
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE ROLE ----------------
  const updateRole = async (userId: string, role: Role) => {
    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      // Update UI instantly
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role");
    }
  };

  // ---------------- DELETE USER ----------------
  const removeUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target?.role === "ADMIN" && adminCount === 1) return;

    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="py-6 text-center text-gray-500 font-poppins">
        Loading users...
      </div>
    );
  }

  return (
    <div className="lg:px-6 px-2 lg:py-6 py-4">
      {/* Header */}
      <div className="flex items-center text-center font-poppins text-md lg:text-2xl md:text-xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
        <div className="w-[30%]">Name</div>
        <div className="w-[30%]">Email</div>
        <div className="w-[20%]">Role</div>
        <div className="w-[20%]">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-300">
        {users.map((user) => {
          const [localPart, domain] = user.email.split("@");
          const isLastAdmin = user.role === "ADMIN" && adminCount === 1;

          return (
            <div
              key={user.id}
              className="flex w-full justify-center text-center items-center font-poppins text-xs md:text-lg leading-[48px] py-3"
            >
              {/* Name */}
              <div className="flex lg:flex-row lg:space-x-2 flex-col justify-center items-center leading-4 lg:leading-8 w-[30%] text-sm lg:text-lg md:text-md text-gray-800">
                <div>{user.firstName}</div>
                <div>{user.lastName}</div>
              </div>

              {/* Email */}
              <div className="flex lg:flex-row flex-col justify-center items-center leading-4 lg:leading-8 w-[30%] text-sm lg:text-lg md:text-md text-gray-800">
                <div>{localPart}</div>
                <div>{domain ? `@${domain}` : ""}</div>
              </div>

              {/* Role */}
              <div className="flex w-[20%] justify-center items-center">
                <Dropdown<Role>
                  items={roles}
                  value={user.role}
                  onChange={(role) => updateRole(user.id, role)}
                  getLabel={(role) => role}
                  getKey={(role) => role}
                  className="w-7/12"
                  openClassName="w-7/12 border-t border-x border-sowma-lighter-gray shadow-lg"
                />
              </div>

              {/* Remove */}
              <div className="flex w-[20%] justify-center">
                {isLastAdmin ? null : (
                  <button
                    aria-label={`Remove ${user.firstName} ${user.lastName}`}
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-sowma-red text-white"
                    onClick={() => removeUser(user.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden="true"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 7.5h12m-9.75 0V6a1.5 1.5 0 0 1 1.5-1.5h4.5a1.5 1.5 0 0 1 1.5 1.5v1.5m-8.25 0v10.5A1.5 1.5 0 0 0 9 19.5h6a1.5 1.5 0 0 0 1.5-1.5V7.5m-6 3v6m3-6v6"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
