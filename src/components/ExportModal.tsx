import { useState } from "react";
import CheckboxTitle from "./CheckboxTitle";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import ExportButton from "../components/ExportButton";
import DateRangeButton from "../components/DateRangeButton";

const titles = [
  "Select All",
  "Instagram",
  "Linkedin",
  "News Letter",
  "Twitter",
  "Facebook",
  "TikTok",
];

interface ModalProps {
  isOpen: boolean;
  setIsOpen: any;
}

export default function ExportModal({ isOpen, setIsOpen }: ModalProps) {
  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>(
    Object.fromEntries(titles.map((name) => [name, false])),
  );

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (name === "Select All") {
      const newState = Object.fromEntries(
        titles.map((platform) => [platform, checked]),
      );
      setCheckedStates(newState);
    } else {
      setCheckedStates((prev) => ({ ...prev, [name]: checked }));
    }
  };

  return (
    <>
      <ExportButton />
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <DialogPanel className="w-[404px] h-[454px] bg-white rounded-xl shadow-lg flex flex-col p-6">
          <DialogTitle className="relative text-xl font-semibold mb-4">
            Select for Export
            <div className="absolute top-[-10px] left-[175px] w-[184px] h-[46px] right-0 opacity-100 rounded-[9px] bg-white border border-[#A1A1A1] border-[0.9px]">
              <DateRangeButton />
            </div>
          </DialogTitle>

          {titles.map((name) => (
            <CheckboxTitle
              key={name}
              name={name}
              checked={checkedStates[name]}
              onChange={(checked) => handleCheckboxChange(name, checked)}
            />
          ))}
        </DialogPanel>
      </Dialog>
    </>
  );
}
