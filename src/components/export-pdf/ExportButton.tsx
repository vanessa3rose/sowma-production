import { useState } from "react";
import ExportModal from "./ExportModal";

export default function ExportButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="py-2 px-4 gap-2 justify-center items-center inline-flex rounded-[10px] border-[1px] border-solid h-[47px] w-[141px] font-bold text-xl font-[Inter]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
          />
        </svg>
        <span>Export</span>
      </button>
      {/*Export Modal is called to redirect to other page using Dialog section */}
      {isModalOpen && (
        <ExportModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      )}
    </>
  );
}
