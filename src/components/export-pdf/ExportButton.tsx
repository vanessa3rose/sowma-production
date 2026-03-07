import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

import ExportModal from "./ExportModal";
import type { Platform } from "../../config/chartConfigs";
import type { DateRangeValue } from "../charts/DateButton";

type Role = "ADMIN" | "USER" | "VIEWER";

interface ExportButtonProps {
  onExport: (
    platforms: Platform[],
    range: DateRangeValue,
  ) => Promise<void> | void;
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // gets role directly from Clerk
  const role = (user?.publicMetadata?.role as Role | undefined) ?? "VIEWER";

  // don't render until auth is ready
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  // VIEWER cannot export
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
