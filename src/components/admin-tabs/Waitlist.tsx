import { useEffect, useState } from "react";
import { mockUsers } from "./mockUsers";

type WaitlistUser = {
  id: string | number;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export default function Waitlist() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWaitlist() {
      try {
        const response = await fetch("/api/waitlist");
        if (!response.ok) throw new Error("Failed to fetch waitlist");
        const data = (await response.json()) as WaitlistUser[];
        setUsers(data);
      } catch {
        // Fallback so admin tab remains usable in dev environments without API data.
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    }

    loadWaitlist();
  }, []);

  return (
    <div className="lg:px-6 px-2 lg:py-6 py-4">
      <div className="flex items-center text-center font-poppins text-md md:text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
        <div className="w-1/3">Name</div>
        <div className="w-1/2">Email</div>
        <div className="w-1/6" />
      </div>

      <div className="divide-y divide-gray-300">
        {loading ? (
          <div className="py-6 text-center text-gray-500 font-poppins">
            Loading waitlist...
          </div>
        ) : users.length === 0 ? (
          <div className="py-6 text-center text-gray-500 font-poppins">
            No waitlist entries yet.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex w-full justify-center text-center items-center font-poppins text-xs md:text-lg leading-[48px] py-3"
            >
              <div className="w-1/3 text-gray-800">
                {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
              </div>

              <div className="flex w-1/2 lg:flex-row flex-col justify-center items-center leading-4 lg:leading-8 text-gray-800">
                <div>{user.email.split("@")[0]}</div>
                <div>{`@${user.email.split("@")[1] ?? ""}`}</div>
              </div>

              <div className="w-1/6 px-1 lg:px-4 flex gap-2 lg:gap-4 lg:flex-row flex-col">
                <button
                  className="flex flex-1 justify-center items-center rounded-full bg-[#4e8bcc] text-white py-1 lg:py-2 px-4 lg:px-6 text-sm md:text-base"
                  onClick={() => console.log(user.email, "Approved")}
                >
                  Approve
                </button>
                <button
                  className="flex flex-1 justify-center items-center rounded-full bg-[#ad3a3b] text-white py-1 lg:py-2 px-4 lg:px-6 text-sm md:text-base"
                  onClick={() => console.log(user.email, "Denied")}
                >
                  Deny
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
