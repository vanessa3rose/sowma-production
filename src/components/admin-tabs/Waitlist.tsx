import { useEffect, useState } from "react";

type WaitlistUser = {
  id: string | number;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export default function Waitlist() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  async function loadWaitlist() {
    try {
      setLoadError("");
      setLoading(true);
      const response = await fetch("/api/waitlist");
      if (!response.ok) throw new Error("Failed to fetch waitlist");
      const data = (await response.json()) as WaitlistUser[];
      setUsers(data);
    } catch {
      setUsers([]);
      setLoadError("Failed to fetch waitlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load waitlist entries for admin review.
    loadWaitlist();
  }, []);

  async function handleWaitlistAction(
    email: string,
    action: "approve" | "deny",
  ) {
    try {
      setBusyEmail(email);
      setStatusMessage("");

      const response = await fetch("/api/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action }),
      });

      const body = await response.json().catch(() => ({}));
      // Mirror API conflict codes into clear admin-facing status text.
      if (!response.ok) {
        if (response.status === 409 && body?.code === "CLERK_DUPLICATE") {
          throw new Error("Failed: User email already in use");
        }
        if (
          response.status === 409 &&
          body?.code === "CLERK_INVITATION_PENDING"
        ) {
          throw new Error("Failed: Invitation already sent");
        }
        throw new Error(body?.error || "Failed to update waitlist entry");
      }

      setUsers((prev) => prev.filter((u) => u.email !== email));
      setStatusMessage(
        typeof body?.message === "string"
          ? body.message
          : action === "approve"
            ? `Approved and invited ${email}`
            : `Denied ${email}`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Failed to update waitlist entry",
      );
    } finally {
      setBusyEmail(null);
    }
  }

  function splitEmail(email: string): {
    localPart: string;
    domainPart: string;
  } {
    const [localPart, domainPart = ""] = email.split("@");
    return { localPart, domainPart };
  }

  return (
    <div className="lg:px-6 px-2 lg:py-6 py-4">
      <div className="flex items-center text-center font-poppins text-md md:text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
        <div className="w-1/3">Name</div>
        <div className="w-1/2">Email</div>
        <div className="w-1/6" />
      </div>

      <div className="divide-y divide-gray-300">
        {loadError ? (
          <div className="py-4 text-center text-sm text-red-600 font-poppins">
            {loadError}{" "}
            <button
              type="button"
              onClick={loadWaitlist}
              className="underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : null}
        {statusMessage ? (
          <div className="py-3 text-center text-sm text-gray-600 font-poppins">
            {statusMessage}
          </div>
        ) : null}
        {loading ? (
          <div className="py-6 text-center text-gray-500 font-poppins">
            Loading waitlist...
          </div>
        ) : users.length === 0 ? (
          <div className="py-6 text-center text-gray-500 font-poppins">
            No waitlist entries yet.
          </div>
        ) : (
          users.map((user) => {
            const { localPart, domainPart } = splitEmail(user.email);
            return (
              <div
                key={user.id}
                className="flex w-full justify-center text-center items-center font-poppins text-xs md:text-lg leading-[48px] py-3"
              >
                <div className="w-1/3 text-gray-800">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                    "—"}
                </div>

                <div className="flex w-1/2 lg:flex-row flex-col justify-center items-center leading-4 lg:leading-8 text-gray-800">
                  <div>{localPart}</div>
                  <div>{`@${domainPart}`}</div>
                </div>

                <div className="w-1/6 px-1 lg:px-4 flex gap-2 lg:gap-4 lg:flex-row flex-col">
                  <button
                    className="relative flex flex-1 justify-center items-center rounded-full bg-[#4e8bcc] text-white py-1 lg:py-2 px-4 lg:px-6 text-sm md:text-base disabled:opacity-80"
                    onClick={() => handleWaitlistAction(user.email, "approve")}
                    disabled={busyEmail === user.email}
                  >
                    <span
                      className={busyEmail === user.email ? "opacity-0" : ""}
                    >
                      Approve
                    </span>
                    {busyEmail === user.email ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      </span>
                    ) : null}
                  </button>
                  <button
                    className="relative flex flex-1 justify-center items-center rounded-full bg-[#ad3a3b] text-white py-1 lg:py-2 px-4 lg:px-6 text-sm md:text-base disabled:opacity-80"
                    onClick={() => handleWaitlistAction(user.email, "deny")}
                    disabled={busyEmail === user.email}
                  >
                    <span
                      className={busyEmail === user.email ? "opacity-0" : ""}
                    >
                      Deny
                    </span>
                    {busyEmail === user.email ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
