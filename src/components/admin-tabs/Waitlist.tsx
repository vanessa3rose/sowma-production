import { useEffect, useState } from "react";

type WaitlistUser = {
  id: string | number;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

type PendingInviteUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

type WaitlistResponse = {
  waitlist: WaitlistUser[];
  pendingInvites: PendingInviteUser[];
};

export default function Waitlist() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInviteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [busyState, setBusyState] = useState<{
    email: string;
    action: "approve" | "deny";
  } | null>(null);

  async function loadWaitlist() {
    try {
      setLoadError("");
      setLoading(true);
      const response = await fetch("/api/waitlist");
      if (!response.ok) throw new Error("Failed to fetch waitlist");
      const data = (await response.json()) as WaitlistResponse;
      setUsers(Array.isArray(data.waitlist) ? data.waitlist : []);
      setPendingInvites(
        Array.isArray(data.pendingInvites) ? data.pendingInvites : [],
      );
    } catch {
      setUsers([]);
      setPendingInvites([]);
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
      setBusyState({ email, action });
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
      loadWaitlist();
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
      setBusyState(null);
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

      <section>
        <h2 className="font-poppins text-xl md:text-2xl text-gray-700 mb-2">
          Waitlist
        </h2>

        {!loading && users.length > 0 ? (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center text-center font-poppins text-md md:text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
            <div>Name</div>
            <div>Email</div>
            <div className="justify-self-end w-[204px]" />
          </div>
        ) : null}

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
            users.map((user) => {
              const { localPart, domainPart } = splitEmail(user.email);
              const isRowBusy = busyState?.email === user.email;
              const isApproveBusy =
                isRowBusy && busyState?.action === "approve";
              const isDenyBusy = isRowBusy && busyState?.action === "deny";
              return (
                <div
                  key={user.id}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2 md:gap-4 text-center font-poppins text-xs md:text-lg leading-[48px] py-3"
                >
                  <div className="text-gray-800">
                    {[user.firstName, user.lastName]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </div>

                  <div className="flex lg:flex-row flex-col justify-center items-center leading-4 lg:leading-8 text-gray-800">
                    <div>{localPart}</div>
                    <div>{`@${domainPart}`}</div>
                  </div>

                  <div className="justify-self-end flex gap-2 lg:gap-4 lg:flex-row flex-col">
                    <button
                      className={`relative flex w-[96px] md:w-[100px] justify-center items-center rounded-full text-white py-1 lg:py-2 px-4 lg:px-6 text-sm md:text-base transition ${
                        isRowBusy && !isApproveBusy
                          ? "bg-[#9dbada] text-white/80"
                          : "bg-[#4e8bcc]"
                      } disabled:opacity-100`}
                      onClick={() =>
                        handleWaitlistAction(user.email, "approve")
                      }
                      disabled={isRowBusy}
                    >
                      <span className={isApproveBusy ? "opacity-0" : ""}>
                        Approve
                      </span>
                      {isApproveBusy ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        </span>
                      ) : null}
                    </button>
                    <button
                      className={`relative flex w-[96px] md:w-[100px] justify-center items-center rounded-full text-white py-1 lg:py-2 px-4 lg:px-6 text-sm md:text-base transition ${
                        isRowBusy && !isDenyBusy
                          ? "bg-[#c88f90] text-white/80"
                          : "bg-[#ad3a3b]"
                      } disabled:opacity-100`}
                      onClick={() => handleWaitlistAction(user.email, "deny")}
                      disabled={isRowBusy}
                    >
                      <span className={isDenyBusy ? "opacity-0" : ""}>
                        Deny
                      </span>
                      {isDenyBusy ? (
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
      </section>

      <section className="mt-8">
        <h2 className="font-poppins text-xl md:text-2xl text-gray-700 mb-2">
          Pending Invites
        </h2>

        {!loading && pendingInvites.length > 0 ? (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center text-center font-poppins text-md md:text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
            <div>Name</div>
            <div>Email</div>
          </div>
        ) : null}

        <div className="divide-y divide-gray-300">
          {loading ? (
            <div className="py-6 text-center text-gray-500 font-poppins">
              Loading pending invites...
            </div>
          ) : pendingInvites.length === 0 ? (
            <div className="py-6 text-center text-gray-500 font-poppins">
              No pending invites yet.
            </div>
          ) : (
            pendingInvites.map((invite) => {
              const { localPart, domainPart } = splitEmail(invite.email);
              return (
                <div
                  key={invite.id}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 md:gap-4 text-center font-poppins text-xs md:text-lg leading-[48px] py-3"
                >
                  <div className="text-gray-800">
                    {[invite.firstName, invite.lastName]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </div>

                  <div className="flex lg:flex-row flex-col justify-center items-center leading-4 lg:leading-8 text-gray-800">
                    <div>{localPart}</div>
                    <div>{`@${domainPart}`}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
