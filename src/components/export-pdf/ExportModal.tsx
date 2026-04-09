import { useState } from "react";
import CheckboxTitle from "./CheckboxTitle";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import DateDropdown, { DateRangeValue } from "../charts/DateButton";
import { Platform, PLATFORM_LABELS } from "../../config/chartConfigs";
import LoadingAnimation from "../LoadingAnimation";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  /**
   * Called when the user clicks "Download PDF" with the platforms
   * they have selected.
   */
  onExport: (
    platforms: Platform[],
    range: DateRangeValue,
  ) => Promise<void> | void;
}

// Label for the "select everything" option at the top of the list.
const SELECT_ALL_LABEL = "SELECT ALL";

/**
 * Platforms that currently support charts & exports.
 * If new platforms are added to CHART_CONFIGS later,
 * they can be added here as well.
 */
const EXPORTABLE_PLATFORMS: Platform[] = [
  "google",
  "constantcontact",
  "facebook",
  "instagram",
  "linkedin",
  "twitter",
];

type CheckedState = Record<string, boolean>;

export default function ExportModal({
  isOpen,
  setIsOpen,
  onExport,
}: ModalProps) {
  // Track which checkboxes are turned on.
  // Keys are either SELECT_ALL_LABEL or a Platform string.
  const [checkedStates, setCheckedStates] = useState<CheckedState>(() => {
    const base: CheckedState = { [SELECT_ALL_LABEL]: false };
    EXPORTABLE_PLATFORMS.forEach((platform) => {
      base[platform] = false;
    });
    return base;
  });
  const [range, setRange] = useState<DateRangeValue>({ id: "30d" });

  /**
   * Handle checkbox changes for either:
   * - "Select All" (toggles every platform)
   * - single platforms (instagram, twitter, etc.)
   */
  const handleCheckboxChange = (
    name: Platform | typeof SELECT_ALL_LABEL,
    checked: boolean,
  ) => {
    if (name === SELECT_ALL_LABEL) {
      // Toggle "Select All" + every platform at once.
      setCheckedStates((prev) => {
        const next: CheckedState = { ...prev, [SELECT_ALL_LABEL]: checked };
        EXPORTABLE_PLATFORMS.forEach((platform) => {
          next[platform] = checked;
        });
        return next;
      });
    } else {
      // Toggle a single platform and update "Select All" accordingly.
      setCheckedStates((prev) => {
        const next: CheckedState = { ...prev, [name]: checked };

        const allSelected = EXPORTABLE_PLATFORMS.every(
          (platform) => next[platform],
        );
        next[SELECT_ALL_LABEL] = allSelected;

        return next;
      });
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleCancel = () => {
    setIsLoading(false);
    setIsOpen(false);
  };

  /**
   * When the user clicks "Download PDF":
   *  - compute selected platforms from checkedStates
   *  - invoke onExport(selectedPlatforms)
   *  - shows loading animation
   *  - close the modal
   */
  const handleDownload = async () => {
    // to show the loading animation
    setIsLoading(true);

    const selectedPlatforms = EXPORTABLE_PLATFORMS.filter(
      (platform) => checkedStates[platform],
    );

    if (selectedPlatforms.length === 0) {
      // Nothing selected: you could show a message here if desired.
      setIsLoading(false);
      return;
    }

    await onExport(selectedPlatforms, range);
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <DialogPanel className="w-[450px] bg-white rounded-xl shadow-lg flex flex-col px-10 py-6">
        <DialogTitle className="relative mb-4 flex items-center justify-between">
          {!isLoading ? (
            <>
              <p className=" flex-1 text-xl font-semibold">Select for Export</p>
              <DateDropdown
                value={range}
                onChange={setRange}
                className="p-1 border-neutral-400 border-[0.9px] rounded-[9px]"
              />
            </>
          ) : (
            <p className=" flex-1 text-xl font-semibold">Generating PDF</p>
          )}
        </DialogTitle>

        <div className="w-full h-[1px] bg-black/40" />

        {!isLoading ? (
          <>
            <div className="w-full mt-5">
              {/* "Select All" checkbox */}
              <CheckboxTitle
                key={SELECT_ALL_LABEL}
                name={SELECT_ALL_LABEL}
                checked={checkedStates[SELECT_ALL_LABEL]}
                onChange={(checked) =>
                  handleCheckboxChange(SELECT_ALL_LABEL, checked)
                }
              />

              {/* One checkbox per exportable platform */}
              {EXPORTABLE_PLATFORMS.map((platform) => (
                <CheckboxTitle
                  key={platform}
                  // Human-readable label (e.g. "Instagram", "Google Analytics")
                  name={PLATFORM_LABELS[platform]}
                  // State is stored under the platform key (e.g. "instagram")
                  checked={checkedStates[platform]}
                  onChange={(checked) =>
                    handleCheckboxChange(platform, checked)
                  }
                />
              ))}
            </div>

            {/* Modal footer buttons */}
            <div className="mt-auto flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 rounded-md bg-black text-white text-sm font-semibold"
              >
                Download PDF
              </button>
            </div>
          </>
        ) : (
          <div className="flex mt-[200px] h-[150px]">
            <LoadingAnimation />
          </div>
        )}
      </DialogPanel>
    </Dialog>
  );
}
