import ExportButton from "./export-pdf/ExportButton";
import { useGlobalPageExporter } from "./export-pdf/GlobalPageExportProvider";

type SocialMediaHeaderProps = {
  lastUpdated: string | null;
  Title: string;
  Link: string;
};

export default function SocialMediaHeader({
  lastUpdated,
  Title,
  Link,
}: SocialMediaHeaderProps) {
  const { exportByPlatforms } = useGlobalPageExporter();

  return (
    <>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-[40px] h-[40px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            {Title}
          </h1>
        </div>

        <div className="flex flex-row justify-center items-center mt-2 lg:mt-0 space-x-4">
          <a
            href={Link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[15px] border border-sowma-blue px-4 py-1.5 text-sowma-blue font-poppins font-semibold inline-block"
          >
            Go to Account
          </a>
          <ExportButton onExport={exportByPlatforms} />
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Last updated: {lastUpdated ?? "No imported data yet"}
      </div>
    </>
  );
}
