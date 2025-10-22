import ExportButton from "../components/ExportButton";

export default function SocialMediaPage() {
  return (
    <>
      <div className="p-4">
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="absolute top-[151px] left-[335px] w-[40px] h-[40px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ 
                width: "40px", 
                height: "40px" 
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h1 className="absolute top-[147px] left-[380px] font-poppins font-semibold text-[40px] flex h-[44px] w-[215px] items-center">
            Instagram
          </h1>
          <select className="absolute top-[142px] left-[1115px] appearance-none w-[184px] h-[46px] border-[1px] border-[#A1A1A1] rounded-[10px] pl-[48px] font-poppins font-bold text-[18px]">
            <option>Date Range</option>
          </select>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
            style={{
              width: "30px",
              height: "30px",
              position: "absolute",
              top: "150px",
              left: "1125px",
              pointerEvents: "none",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
            style={{
              width: "15px",
              height: "15px",
              top: "158px",
              left: "1271px",
              position: "absolute",
              pointerEvents: "none",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>

          <div className="absolute left-[1323px] top-[141px]">
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
