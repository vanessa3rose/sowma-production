import { useEffect, useState } from "react";

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
        <div className="w-[20%]">Remove</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-300">
        {users.map((user) => {
          const [localPart, domain] = user.email.split("@");

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
              <div className="flex w-[20%] justify-center">
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value as Role)}
                  className="lg:px-6 px-2 py-2 mx-1 rounded-full border-2 border-[#7B7C7C] text-xs md:text-lg leading-none"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              {/* Remove */}
              <div className="flex w-[20%] justify-center">
                <button
                  aria-label={`Remove ${user.firstName} ${user.lastName}`}
                  className="flex w-1/2 pt-0.5 items-center justify-center rounded-full bg-[#ad3a3b] text-white text-2xl leading-none"
                  onClick={() => removeUser(user.id)}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
