import facebook from "../assets/facebook.jpg";
import google from "../assets/google.jpg";
import instagram from "../assets/instagram.jpg";
import linkedin from "../assets/linkedin.jpg";
import twitter from "../assets/twitter.jpg";
import tiktok from "../assets/tiktok.jpg";

import ExportButton from "../components/ExportButton";

export default function Homepage() {
  return (
    <>
      <div className="static">
        {/* div for below search bar that contains date range, social media, and file export buttons */}
        <div className="absolute top-[139px] left-[337px] flex items-center gap-[21px] justify-center h-auto bg-white">
          {/* date range button */}

          <button
            id="hs-dropdown-default"
            type="button"
            className="hs-dropdown-toggle py-2 px-4 inline-flex rounded-[10px] items-center justify-center gap-2 border-[1px] border-solid h-[47px] w-[184px] font-bold text-lg font-[Inter]"
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
                d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
              />
            </svg>
            <span>Date Range</span>
          </button>

          {/* social media icons that are links to statistic pages */}

          <a href="/">
            {/* the above will eventually be a file path to the google metrics page */}
            <img
              src={google}
              className="w-10 h-10 hover:opacity-80 transition rounded-[10px] border-[1px] border-solid"
            />
          </a>

          <a href="/">
            {/* the above will eventually be a file path to the instagram metrics page */}
            <img
              src={instagram}
              className="w-10 h-10 hover:opacity-80 transition rounded-[10px] border-[1px] border-solid"
            />
          </a>

          <a href="/">
            {/* the above will eventually be a file path to the facebook metrics page */}
            <img
              src={facebook}
              className="w-10 h-10 hover:opacity-80 transition rounded-[10px] border-[1px] border-solid"
            />
          </a>

          <a href="/">
            {/* the above will eventually be a file path to the tiktok metrics page */}
            <img
              src={tiktok}
              className="w-10 h-10 hover:opacity-80 transition rounded-[10px] border-[1px] border-solid"
            />
          </a>

          <a href="/">
            {/* the above will eventually be a file path to the facelinkedinbook metrics page */}
            <img
              src={linkedin}
              className="w-10 h-10 hover:opacity-80 transition rounded-[10px] border-[1px] border-solid"
            />
          </a>

          <a href="/">
            {/* the above will eventually be a file path to the twitter metrics page */}
            <img
              src={twitter}
              className="w-10 h-10 hover:opacity-80 transition rounded-[10px] border-[1px] border-solid"
            />
          </a>

          <a href="/">
            {/* the above is a link to a newsletter i think? */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 w-10 h-10 hover:opacity-80 transition rounded-[10px] border-[1px] border-solid"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
              />
            </svg>
          </a>

          {/* icon for file export button */}
          <ExportButton />
        </div>
      </div>

      <div className="flex items-center gap-[21px] justify-center h-auto bg-white">
        {/***********************************Impressions BOX Row 0, Column 0***********************************/}
        <div className="w-[374px] h-[328px] bg-white rounded-[15px] opacity-100 shadow-[0_4px_4px_rgba(0,0,0,0.25)] absolute top-[221px] left-[337px] p-6 flex flex-col gap-[10px]">
          {/* Top rectangle holding Impressions, Instagram, this week */}
          <div
            className="
    w-[326px] h-[32px] 
    opacity-100 
    bg-white 
    flex items-center
    gap-x-2"
          >
            {/* Impressions box */}
            <div
              className="
      w-[96px] h-[24px] 
      bg-white 
      flex items-center
      "
            >
              <span
                className="
        font-poppins 
        font-medium 
        text-[16px] leading-[100%] 
        text-black"
              >
                Impressions
              </span>
            </div>

            {/* Instagram box */}
            <div className="flex-1 flex items-center justify-end pr-1">
              <div
                className="
      w-[92px] h-[24px] 
      bg-white 
      flex items-center justify-center
     "
              >
                <div className="flex-1 flex items-center justify-end pr-1 pt-1">
                  <span className="font-poppins font-medium text-[12px] text-black">
                    Instagram
                  </span>
                </div>
              </div>
              {/* Right box — 24x24 white square */}
              <div
                className="
          w-[24px] h-[24px] 
          bg-white 
          opacity-100
          flex items-center justify-center
        "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>

              {/* This week box */}
              <div className="w-[85px] h-[24px] bg-black flex items-center justify-center">
                {/* Inner white container */}
                <div className="w-full h-[24px] bg-white flex items-center">
                  {/* Text container */}
                  <div className="flex-1 flex items-center justify-end pr-1 pt-1 whitespace-nowrap">
                    <span className="font-poppins font-medium text-[12px] text-black">
                      This Week
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="w-[24px] h-[24px] flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*2nd row with engagement difference number */}
          <div
            className="
    w-[326px] h-[48px] 
    bg-white 
    opacity-100 
    flex items-center justify-start 
    gap-x-2.5 
    p-0"
          >
            <div className="relative w-[60px] h-[48px] opacity-100">
              <span className="absolute top-0 left-0 font-poppins font-normal text-[32px] tracking-[-0.0375em] text-sowma-blue text-left">
                [+XX]
              </span>
            </div>
          </div>
          {/*3rd row with total */}
          <div
            className=" 
    w-[68px] h-[40px] 
    bg-white opacity-100 
    flex flex-row justify-start items-start 
    gap-x-2.5 
    pb-4"
          >
            {/* Text inside */}
            <span
              className="
      w-full h-[24px] 
      font-poppins 
      font-normal 
      text-[16px] 
      text-black 
      text-left 
      leading-normal 
      tracking-normal"
            >
              Total: XX
            </span>
          </div>
          {/*4th row with grid and legend */}
          <div className="w-[326px] h-[168px] bg-white opacity-100 flex flex-col justify-start items-start ">
            {/*grid box */}
            <div className="w-[326px] h-[106px] bg-white opacity-100 flex flex-row justify-start items-start gap-x-2 p-0">
              {/*TODO: remove comment and Center grid here */}
            </div>

            {/*Legend that has 2 contents*/}
            <div className="relative w-[326px] h-[52px] bg-white opacity-100 flex items-start justify-start gap-[10px]">
              {/*Content #1 Box with circle and content */}
              <div className="absolute top-[24px] left-0 w-[65px] h-[20px] bg-white opacity-100 flex flex-row items-start justify-start py-[1px]">
                <div className="absolute top-[2px] left-0 w-[16px] h-[16px] bg-white opacity-100">
                  {/*blue circle */}
                  <div className="absolute top-[4px] left-[4px] w-[8px] h-[8px] bg-[#7987ff] opacity-100 rounded-full"></div>
                </div>
                <div className="absolute top-[1px] left-[16px] w-[49px] h-[18px] bg-white opacity-100 flex flex-row items-start justify-start gap-[10px]">
                  {/*Content text */}
                  <div className="w-[49px] h-[18px] opacity-100 text-black font-poppins font-medium text-[12px] leading-none flex items-center justify-start">
                    Content
                  </div>
                </div>
              </div>

              {/*Content #2 */}
              <div className="absolute top-[24px] left-[73px] w-[65px] h-[20px] bg-white opacity-100 flex flex-row items-start justify-start py-[1px]">
                <div className="absolute top-[2px] left-0 w-[16px] h-[16px] bg-white opacity-100">
                  {/*pink circle */}
                  <div className="absolute top-[4px] left-[4px] w-[8px] h-[8px] bg-[#E697FF] opacity-100 rounded-full"></div>
                </div>
                <div className="absolute top-[1px] left-[16px] w-[49px] h-[18px] bg-white opacity-100 flex flex-row items-start justify-start gap-[10px]">
                  {/*Content text */}
                  <div className="w-[49px] h-[18px] opacity-100 text-black font-poppins font-medium text-[12px] leading-none flex items-center justify-start">
                    Content
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/***********************************Box in COLUMN 1, ROW 0 Days posted***********************************/}
        <div className="absolute top-[221px] left-[742px] w-[372px] h-[329px] bg-white-500 opacity-100 rounded-[15px] shadow-[0_3.6px_3.6px_0_rgba(0,0,0,0.25)]"></div>
        {/*Figma formatted it this way where this is the actual content of COLUMN 1, ROW 0 Days posted */}
        <div className="absolute top-[273.3px] left-[716px] w-[384px] h-[275px] opacity-100 flex flex-wrap gap-[9px]">
          {/*Holds Row and chart */}
          <div className="absolute top-0 left-[40.5px] w-[324px] h-[244.8px] bg-white opacity-100 flex flex-wrap gap-[9px]">
            {/*Row with instagram linkedin tiktok, and facebook */}
            <div className="absolute top-0 left-0 w-[343.2px] h-[31.2px] bg-white opacity-100 flex flex-row items-start justify-start gap-[9px]">
              <button className="absolute top-0 left-0 text-[10px] font-bold w-[90.8px] h-[31.2px] px-[14.4px] py-[8.1px] border border-black opacity-100 bg-white text-black rounded-[45px] flex items-center justify-center hover:bg-[#FFA9D0] hover:text-white hover:border-[#FFA9D0] transition">
                INSTAGRAM
              </button>
              <button className="absolute top-0 left-[99.8px] text-[10px] font-bold w-[74.8px] h-[31.2px] px-[14.4px] py-[8.1px] border border-black opacity-100 bg-white text-black rounded-[45px] flex items-center justify-center hover:bg-[#FFA9D0] hover:text-white hover:border-[#FFA9D0] transition">
                LINKEDIN
              </button>
              <button className="absolute top-0 left-[183.6px] text-[10px] font-bold w-[65.8px] h-[31.2px] px-[14.4px] py-[8.1px] border border-black opacity-100 bg-white text-black rounded-[45px] flex items-center justify-center hover:bg-[#FFA9D0] hover:text-white hover:border-[#FFA9D0] transition">
                TIKTOK
              </button>
              <button className="absolute top-0 left-[258.4px] text-[10px] font-bold w-[84.8px] h-[31.2px] px-[14.4px] py-[8.1px] border border-black opacity-100 bg-white text-black rounded-[45px] flex items-center justify-center hover:bg-[#FFA9D0] hover:text-white hover:border-[#FFA9D0] transition">
                FACEBOOK
              </button>
            </div>

            {/*Months + graph */}
            <div className="absolute top-[40.5px] left-[26.1px] w-[291.6px] h-[195.3px] bg-white opacity-100 flex flex-col items-start justify-start gap-[9px]">
              {/*TODO: place graph here */}
            </div>
          </div>
        </div>
        {/*text box thats floating outside ontop of Daysposted box.*/}
        <div className="absolute top-[240px] left-[763.2px] w-[100px] h-[21px] opacity-100 text-black font-poppins font-medium text-[16px] leading-[128.7%] flex items-start justify-start">
          Days Posted
        </div>

        {/**********************************ROW 0, COLUMN 2 website seesion BOX****************************/}
        <div className="absolute top-[221px] left-[1132px] w-[360px] h-[329px] opacity-100 flex flex-col items-start justify-start gap-[10px] rounded-[15px] bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
          {/*Top row */}
          <div className="absolute top-[16px] left-[24px] w-[312px] h-[32px] bg-white opacity-100 flex flex-row items-start justify-start pb-[8px]">
            <div className="absolute top-0 left-0 w-[156px] h-[24px] bg-white opacity-100 flex items-start justify-start gap-[132px]">
              <div className="w-[140px] h-[24px] opacity-100 text-black font-poppins font-medium text-[16px] leading-normal flex items-start justify-start">
                Website Sessions
              </div>
            </div>
            <div className="absolute top-0 left-[156px] w-[156px] h-[24px] bg-white opacity-100 flex items-start justify-end">
              {/*Box with arrow */}
              <div className="absolute top-0 left-[132px] w-[24px] h-[24px] bg-white opacity-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 8 4"
                  strokeWidth={1}
                  stroke="black"
                  className="absolute top-[10px] left-[8px] w-[8px] h-[4px]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M0 0L4 4L8 0"
                  />
                </svg>
              </div>
              <div className="absolute top-[5px] left-[71px] w-[61px] h-[18px] bg-white opacity-100">
                <div className="w-[61px] h-[18px] opacity-100 text-black font-poppins font-medium text-[12px] leading-normal flex items-start justify-end">
                  This Week
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-[48px] left-[24px] w-[312px] h-[48px] bg-white opacity-100 flex flex-row items-start justify-start gap-[10px]">
            <div className="w-[57px] h-[48px] opacity-100 text-sowma-blue font-poppins font-normal text-[32px] leading-normal tracking-[-3.75%] flex items-start justify-start">
              [XXX]
            </div>
          </div>
          <div className="absolute top-[96px] left-[24px] w-[227px] h-[40px] bg-white opacity-100 flex flex-row items-start justify-start gap-[10px] pb-[16px]">
            <div className="w-[227px] h-[24px] font-poppins font-normal text-[16px] leading-normal tracking-[0%] flex items-start justify-start text-black selection:text-[#009D1A]">
              [Percent text]
            </div>
          </div>
          <div className="absolute left-[24px] top-[136px] flex flex-row items-start justify-start gap-[10px] p-[10px] w-[312px] h-[169px] bg-white opacity-100">
            <div className="absolute left-[10px] top-[10px] w-[141px] h-[149px] bg-white opacity-100">
              {/*TODO: insert graph here */}
            </div>
            <div className="absolute left-[161px] top-[10px] w-[141px] h-[149px] bg-white opacity-100">
              <div className="absolute left-[31.5px] top-[40.5px] w-[78px] h-[68px] items-start justify-start gap-[4px] opacity-100">
                {/*TODO: insert color content here */}
              </div>
            </div>
          </div>
        </div>

        {/***********************************Follower Count COLUMN 0, ROW 1***********************************/}
        <div className="absolute left-[334px] top-[570px] w-[583px] h-[398px] bg-white rounded-[25px] opacity-100 shadow-[0_3px_8px_0_rgba(34,34,34,0.24)] border-opacity-100">
          <div className="absolute left-[31px] top-[24px] w-[163px] h-[30px] bg-white opacity-100">
            <div className="absolute left-0 top-0 w-[163px] h-[30px] opacity-100 text-[#111618] text-[20px] font-poppins font-medium leading-none text-left">
              Follower Count
            </div>
          </div>
          <div className="absolute left-[24px] top-[78px] w-[530px] h-[56px] bg-white flex flex-row items-start justify-start gap-[10px] opacity-100">
            <div className="absolute left-[12px] top-0 w-[66px] h-[56px] bg-white flex flex-row items-start justify-start opacity-100 py-[16px]">
              <div className="absolute left-[4px] top-[-5px] w-[54px] h-[12px] opacity-100 text-[#1976D2] text-[12px] leading-[12px] font-[‘AG Input/Label’] text-left align-middle">
                Search by
              </div>
              <div className="absolute left-0 top-[16px] w-[32px] h-[24px] flex flex-row items-start justify-start opacity-100 pr-[8px] ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="absolute left-0 top-0 w-[24px] h-[24px] opacity-100"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <div className="absolute left-[32px] top-[16px] w-[34px] h-[24px] text-black text-left font-[‘AG Input/Value’] opacity-100 ">
                Date
              </div>
            </div>
          </div>
          <div className="absolute left-[24px] top-[148px] w-[530px] h-[185px] bg-white flex flex-row items-start justify-start gap-[8px] opacity-100">
            {/*TODO:graph stuff here */}
          </div>
          <div className="absolute left-[164px] top-[357px] w-[249px] h-[17px] bg-white flex flex-row items-start justify-center gap-[16px] opacity-100">
            <div className="absolute left-0 top-0 flex flex-row w-[83px] h-[17px] justify-start bg-white">
              <div className="absolute left-0 top-[1.5px] w-[14px] h-[14px] bg-[#EC73FF] rounded-full opacity-100"></div>
              <div className="absolute left-[22px] top-0 w-[61px] h-[17px] opacity-100 text-black text-[14px] font-[‘AG Body/Body 2’] text-left leading-[17px]">
                Instagram
              </div>
            </div>
            <div className="absolute left-[99px] top-0 flex flex-row w-[150px] h-[17px] justify-start bg-white gap-[10px] opacity-100">
              <div className="absolute left-0 top-[1.5px] w-[14px] h-[14px] bg-[#8A38F5] rounded-full opacity-100"></div>
              <div className="absolute left-[22px] top-0 w-[59px] h-[17px] opacity-100 text-black text-[14px] font-[‘AG Body/Body 2’] text-left leading-[17px]">
                Facebook
              </div>
              <div className="absolute left-[89px] top-[1.5px] w-[14px] h-[14px] bg-[#F76090] rounded-full opacity-100"></div>
              <div className="absolute left-[111px] top-0 w-[39px] h-[17px] opacity-100 text-black text-[14px] font-[‘AG Body/Body 2’] text-left leading-[17px]">
                Tiktok
              </div>
            </div>
          </div>
        </div>

        {/***********************************How Did You Hear COLUMN 1, ROW 1***********************************/}
        <div className="absolute left-[938px] top-[579px] w-[554px] h-[389px] bg-white rounded-[25px] opacity-100 shadow-[0_3px_8px_0_rgba(34,34,34,0.24)] border-opacity-100 flex flex-col items-start justify-start gap-[10px]">
          <div className="absolute left-[24px] top-[16px] w-[506px] h-[32px] flex flex-row items-start pb-[8px] opacity-100 bg-white">
            <div className="absolute left-0 top-0 w-[364px] h-[24px] items-start gap-[132px] opacity-100 bg-white">
              <div className="absolute left-0 top-0 w-[225px] h-[24px] opacity-100 text-black text-[16px] font-medium font-poppins text-left leading-auto">
                How did you hear about us?
              </div>
            </div>
            <div className="absolute left-[346px] top-0 w-[160px] h-[24px] items-end opacity-100">
              <div className="absolute left-0 top-[3px] w-[136px] h-[18px] bg-white items-end gap-[10px] opacity-100">
                <div className="absolute left-[75px] top-0 w-[61px] h-[18px] opacity-100 bg-white">
                  <div className="absolute left-0 top-0 w-[61px] h-[18px] opacity-100 text-black text-[12px] font-medium font-poppins text-right leading-auto">
                    This Week
                  </div>
                </div>
              </div>
              <div className="absolute left-[136px] top-0 w-[24px] h-[24px] opacity-100 bg-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 8 4"
                  strokeWidth={1}
                  stroke="black"
                  className="absolute left-[8px] top-[10px] w-[8px] h-[4px] opacity-100"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M0 0L4 4L8 0"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute left-[24px] top-[88px] w-[526px] h-[244px] opacity-100 bg-white">
            {/*TODO: Graph stuff here */}
          </div>
        </div>
      </div>
    </>
  );
}
