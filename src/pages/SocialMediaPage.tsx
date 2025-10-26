import DateRangeButton from "../components/date-range/DateRangeButton";
import ExportButton from "../components/export-pdf/ExportButton";
import BigCard from "../components/cards/BigCard";
import SmallCard from "../components/cards/SmallCard";
import LineCharts from "../components/charts/LineCharts";
import PieCharts from "../components/charts/PieCharts";

{
  /* Example on how to visually see charts inside of cards. Not needed, but helpful 
  for future people editing*/
}
const pieTestData = [
  { source: "Organic", value: 400 },
  { source: "Paid", value: 300 },
  { source: "Referral", value: 200 },
  { source: "Social", value: 100 },
];

const lineTestData = [
  { date: "01", followers: 100, likes: 20, comments: 5 },
  { date: "02", followers: 120, likes: 35, comments: 8 },
  { date: "03", followers: 140, likes: 50, comments: 10 },
  { date: "04", followers: 160, likes: 45, comments: 7 },
  { date: "05", followers: 180, likes: 60, comments: 12 },
];

export default function SocialMediaPage() {
  return (
    <>
      <div className="w-[1140px] h-[722px] bg-white flex flex-col gap-4">
        <div className="w-[1129px] h-[50px] flex flex-row">
          <div className="flex flex-row w-4/5 mx-6 justify-between">
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
        </div>
        <div className="w-[1140px] h-[620px] bg-white flex flex-row gap-4">
          <div className="w-[242px] h-[620] flex flex-col bg-white gap-4">
            <SmallCard
              title="Followers"
              displayMode={"both"}
              className={"w-[242px] h-[146px]"}
            ></SmallCard>
            <SmallCard
              title={"Comments"}
              displayMode={"both"}
              className={"w-[242px] h-[143px]"}
            ></SmallCard>
            <SmallCard
              title={"Likes"}
              displayMode={"both"}
              className={"w-[242px] h-[143px]"}
            ></SmallCard>
            <SmallCard
              title={"Shared"}
              displayMode={"both"}
              className={"w-[242px] h-[143px]"}
            ></SmallCard>
          </div>
          <div className="w-[875px] h-[616px] flex flex-col gap-4 bg-white">
            <div className="w-[875px] h-[288px] bg-white flex flex-row justify-center items-center gap-4">
              <BigCard
                title={"Impressions"}
                chart={
                  <LineCharts
                    data={lineTestData}
                    width={326}
                    height={168}
                    xAxisKey="date"
                    dataKeys={["likes"]}
                    showArea={true}
                  />
                }
                displayMode={"both"}
                className={"w-[374px] h-[288px]"}
              ></BigCard>
              <BigCard
                title={"Demographics - Gender"}
                chart={
                  <PieCharts
                    data={pieTestData}
                    width={430}
                    height={213}
                    dataKey={"value"}
                    nameKey={"source"}
                  ></PieCharts>
                }
                displayMode={"both"}
                className={"w-[478px] h-[285px]"}
              ></BigCard>
            </div>
            <div className="w-[875px] h-[293px] bg-white flex flex-row justify-center items-center gap-4">
              <BigCard
                title={"Reach Sources"}
                chart={
                  <PieCharts
                    data={pieTestData}
                    width={430}
                    height={213}
                    dataKey={"value"}
                    nameKey={"source"}
                  ></PieCharts>
                }
                displayMode={"both"}
                className={"w-[473px] h-[293px]"}
              ></BigCard>
              <BigCard
                title={"Days Posted"}
                chart={undefined}
                displayMode={"both"}
                className={"w-[374px] h-[303px]"}
              ></BigCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
