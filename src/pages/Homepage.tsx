import facebook from "../assets/facebook.jpg";
import google from "../assets/google.jpg";
import instagram from "../assets/instagram.jpg";
import linkedin from "../assets/linkedin.jpg";
import twitter from "../assets/twitter.jpg";
import tiktok from "../assets/tiktok.jpg";

import ExportButton from "../components/export-pdf/ExportButton";
import DateRangeButton from "../components/date-range/DateRangeButton";

{
  /* Need to use these charts currently undifined in the BigCards. I kept
  them here just as a reminder.*/
}
import BarCharts from "../components/charts/BarCharts";
import PieCharts from "../components/charts/PieCharts";
import LineCharts from "../components/charts/LineCharts";

import BigCard from "../components/cards/BigCard";

export default function Homepage() {
  return (
    <>
      <div className="w-[1175px] h-[804px] static flex flex-col bg-white">
        {/* div for below search bar that contains date range, social media, and file export buttons */}
        <div className="flex items-center gap-[21px] justify-start h-auto bg-white">
          {/* date range button */}
          <DateRangeButton />

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
        <div className="w-[1151px] h-[747px] bg-white flex flex-col gap-4">
          <div className="w-[1151px] h-[328px] flex flex-row opactity-100 bg-white gap-4">
            <BigCard
              title="Impressions"
              subtitle=""
              chart={undefined}
              displayMode={"both"}
              className={"w-[374px] h-[328px]"}
            ></BigCard>

            <BigCard
              title="Days Posted"
              subtitle=""
              chart={undefined}
              displayMode={"both"}
              className={"w-[372px] h-[329px]"}
            ></BigCard>

            <BigCard
              title="Website Sessions"
              subtitle=""
              chart={undefined}
              displayMode={"both"}
              className={"w-[360px] h-[329px]"}
            ></BigCard>
          </div>

          <div className="w-[1151px] h-[398px] flex flex-row justify-center items-center opactity-100 bg-white opacity gap-4">
            <BigCard
              title="Follower Count"
              subtitle=""
              chart={undefined}
              displayMode={"both"}
              className={"w-[583px] h-[398px]"}
            ></BigCard>
            <BigCard
              title="How did you hear about us?"
              subtitle=""
              chart={undefined}
              displayMode={"both"}
              className={"w-[554px] h-[337px]"}
            ></BigCard>
          </div>
        </div>
      </div>
    </>
  );
}
