import DateRangeButton from "../components/date-range/DateRangeButton";
import ExportButton from "../components/export-pdf/ExportButton";

export default function SocialMediaPage() {
  return (
    <>
      <div className="p-4 flex flex-row">
        <div className="w-1/5" />
        <div className="flex flex-row w-4/5 pt-32 mx-6 justify-between">
          <div className="flex flex-row">
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

            <h1 className="font-poppins font-semibold text-[40px] flex h-[44px] w-[215px] items-center">
              Instagram
            </h1>
          </div>

          <div className="flex flex-row justify-end space-x-2">
            <DateRangeButton />
            <ExportButton />
          </div>
        </div>

        <div className="absolute top-[220px] left-[320px] w-[200px] h-[130px] bg-[#ffffff] border-[1px] border-[#E5E5E5] rounded-[12px] shadow-md">
          <p className="font-poppins font-medium text-[16px] color-[#000000] mt-[12px] ml-[20px]">
            Followers
          </p>
        </div>

        <div className="absolute top-[365px] left-[320px] w-[200px] h-[130px] bg-[#ffffff] border-[1px] border-[#E5E5E5] rounded-[12px] shadow-md">
          <p className="font-poppins font-medium text-[16px] color-[#000000] mt-[12px] ml-[20px]">
            Comments
          </p>
        </div>

        <div className="absolute top-[510px] left-[320px] w-[200px] h-[130px] bg-[#ffffff] border-[1px] border-[#E5E5E5] rounded-[12px] shadow-md">
          <p className="font-poppins font-medium text-[16px] color-[#000000] mt-[12px] ml-[20px]">
            Likes
          </p>
        </div>

        <div className="absolute top-[655px] left-[320px] w-[200px] h-[130px] bg-[#ffffff] border-[1px] border-[#E5E5E5] rounded-[12px] shadow-md">
          <p className="font-poppins font-medium text-[16px] color-[#000000] mt-[12px] ml-[20px]">
            Shared
          </p>
        </div>

        <div className="absolute top-[220px] left-[540px] w-[400px] h-[260px] bg-[#ffffff] border-[1px] border-[#E5E5E5] rounded-[12px] shadow-md">
          <p className="font-poppins font-medium text-[16px] color-[#000000] mt-[12px] ml-[20px]">
            Impressions
          </p>
        </div>

        <div className="absolute top-[500px] left-[540px] w-[480px] h-[280px] bg-[#ffffff] border-[1px] border-[#E5E5E5] rounded-[12px] shadow-md">
          <p className="font-poppins font-medium text-[16px] color-[#000000] mt-[12px] ml-[20px]">
            Reach Sources
          </p>
        </div>

        <div className="absolute top-[220px] left-[960px] w-[520px] h-[260px] bg-[#ffffff] border-[1px] border-[#E5E5E5] rounded-[12px] shadow-md">
          <p className="font-poppins font-medium text-[16px] color-[#000000] mt-[12px] ml-[20px]">
            Demographics - Gender
          </p>
        </div>

        <div className="absolute top-[500px] left-[1040px] w-[440px] h-[280px] bg-[#ffffff] border-[1px] border-[#E5E5E5] rounded-[12px] shadow-md">
          <p className="font-poppins font-medium text-[16px] color-[#000000] mt-[12px] ml-[20px]">
            Days Posted
          </p>
        </div>
      </div>
    </>
  );
}
