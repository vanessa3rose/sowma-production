import { useState } from "react";
import ExportModal from "./ExportModal";
import type { Platform } from "../../config/chartConfigs";
import type { DateRangeId } from "../charts/DateDropdown";

interface ExportButtonProps {
  onExport: (
    platforms: Platform[],
    range: DateRangeId,
  ) => Promise<void> | void;
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="font-poppins text-lg text-[#ffffff] py-2 px-4 gap-2 justify-center items-center inline-flex rounded-[15px] border-[1px] border-solid h-[40px] w-[96px] bg-[#0077B6]"
      >
        <span>Export</span>
      </button>

      {isModalOpen && (
        <ExportModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onExport={onExport} // ✔ just pass through
        />
      )}
    </>
  );
}
