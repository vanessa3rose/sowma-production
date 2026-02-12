import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

import ExportModal from "./ExportModal";
import type { Platform } from "../../config/chartConfigs";
import type { DateRangeId } from "../charts/DateDropdown";

type Role = "ADMIN" | "USER" | "VIEWER";

interface ExportButtonProps {
  onExport: (platforms: Platform[], range: DateRangeId) => Promise<void> | void;
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  const { user, isLoaded, isSignedIn } = useUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRoleByEmail(email: string) {
      setRoleLoading(true);
      try {
        const resp = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
        const json = await resp.json();
        const fetchedRole = (json?.data?.[0]?.role as Role | undefined) ?? "VIEWER";
        if (!cancelled) setRole(fetchedRole);
      } catch {
        // Fail closed: if anything goes wrong, hide Export (treat as VIEWER)
        if (!cancelled) setRole("VIEWER");
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    }

    if (!isLoaded) return;

    if (!isSignedIn) {
      setRole(null);
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      setRole("VIEWER");
      return;
    }

    fetchRoleByEmail(email);

    return () => {
      cancelled = true;
    };
  }, [user, isLoaded, isSignedIn]);

  // If auth/role isn't ready yet, don't show Export (prevents flicker)
  if (!isLoaded || !isSignedIn || roleLoading || role === null) {
    return null;
  }

  // VIEWERs cannot export
  if (role === "VIEWER") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="font-poppins text-lg text-[#ffffff] py-2 px-4 gap-2 justify-center items-center inline-flex rounded-[15px] border-[1px] border-solid h-[40px] w-[96px] bg-[#4781C2]"
      >
        <span>Export</span>
      </button>

      {isModalOpen && (
        <ExportModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onExport={onExport}
        />
      )}
    </>
  );
}