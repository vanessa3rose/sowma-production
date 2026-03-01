import { useEffect, useState } from "react";

type WaitlistUser = {
  id: string;
  email: string;
  createdAt?: string;
};

export default function Waitlist() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch waitlisted users
  useEffect(() => {
    async function fetchWaitlist() {
      try {
        const res = await fetch("/api/waitlist"); // adjust path if needed
        const data = await res.json();
        setUsers(data.data || []);
      } catch (error) {
        console.error("Failed to fetch waitlist users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWaitlist();
  }, []);

  // Remove user (Deny)
  const handleDeny = async (email: string) => {
    try {
      await fetch("/api/waitlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Remove from UI immediately
      setUsers((prev) => prev.filter((u) => u.email !== email));
    } catch (error) {
      console.error("Failed to remove user:", error);
    }
  };

  // Approve (you'll likely add Clerk logic later)
  const handleApprove = (email: string) => {
    console.log(email, "Approved");
    // You can later:
    // 1. Create Clerk user
    // 2. Delete from waitlist
    // 3. Refresh state
  };

  if (loading) {
    return <div className="p-6">Loading waitlist...</div>;
  }

  return (
    <div className="lg:px-6 px-2 lg:py-6 py-4">
      <div className="flex items-center text-center font-poppins text-md md:text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
        <div className="w-2/3">Email</div>
        <div className="w-1/3" />
      </div>

      <div className="divide-y divide-gray-300">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex w-full justify-center text-center items-center font-poppins text-xs md:text-lg leading-[48px] py-3"
          >
            {/* Email */}
            <div className="flex w-2/3 lg:flex-row flex-col justify-center items-center leading-4 lg:leading-8 text-gray-800">
              <div>{user.email}</div>
            </div>

            {/* Actions */}
            <div className="w-1/4 lg:w-1/3 px-1 lg:px-4 flex gap-2 lg:gap-4 lg:flex-row flex-col">
              <button
                className="flex flex-1 justify-center items-center rounded-full bg-[#4e8bcc] text-white py-1 lg:py-2 px-6 lg:px-8 text-sm md:text-base lg:text-lg"
                onClick={() => handleApprove(user.email)}
              >
                Approve
              </button>

              <button
                className="flex flex-1 justify-center items-center rounded-full bg-[#ad3a3b] text-white py-1 lg:py-2 px-6 lg:px-8 text-sm md:text-base lg:text-lg"
                onClick={() => handleDeny(user.email)}
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
