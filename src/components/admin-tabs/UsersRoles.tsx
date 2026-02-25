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
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.data);
    setLoading(false);
  };

  // ---------------- UPDATE ROLE ----------------
  const updateRole = async (userId: string, role: Role) => {
    await fetch(`/api/users?id=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    // Update UI instantly
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  // ---------------- DELETE USER ----------------
  const removeUser = async (userId: string) => {
    await fetch(`/api/users?id=${userId}`, {
      method: "DELETE",
    });

    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  if (loading) {
    return <div className="p-6 text-xl">Loading users...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="grid grid-cols-[2fr,2fr,1fr,1fr] items-center text-center font-poppins text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
        <span>Name</span>
        <span>Email</span>
        <span>Role</span>
        <span>Remove</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-300">
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[2fr,2fr,1fr,1fr] items-center text-center font-poppins text-xl leading-[48px] py-3"
          >
            {/* Name */}
            <div className="text-gray-800">
              {user.firstName} {user.lastName}
            </div>

            {/* Email */}
            <div className="text-gray-800">{user.email}</div>

            {/* Role Dropdown */}
            <div className="flex justify-center">
              <select
                value={user.role}
                onChange={(e) => updateRole(user.id, e.target.value as Role)}
                className="border-2 border-[#7B7C7C] rounded-full px-5 py-2 text-gray-800 bg-white min-w-[130px] text-lg"
              >
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            {/* Remove Button */}
            <div className="flex justify-center">
              <button
                aria-label={`Remove ${user.firstName}`}
                className="px-5 py-2 min-w-[90px] h-12 flex items-center justify-center rounded-full border-2 border-[#FF1313] text-[#FF1313] text-2xl leading-none"
                onClick={() => removeUser(user.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
