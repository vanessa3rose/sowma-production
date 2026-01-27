export default function GlossaryPage() {
  const items = [
    {
      term: "API",
      definition:
        "A system that allows one tool to connect and retrieve data from another tool.",
    },
    {
      term: "Bounce Rate",
      definition:
        "The percentage of website visitors who leave after viewing one page.",
    },
    {
      term: "Reach",
      definition: "The number of unique users who saw your content.",
    },
    {
      term: "Impressions",
      definition:
        "The total number of times your content was displayed, including repeats.",
    },
    {
      term: "Engagement Rate",
      definition:
        "A measure of how much people interact with your content relative to followers or reach.",
    },
  ];

  return (
    <div className="w-full min-h-screen lg:h-full bg-white flex flex-col py-4">
      <div className="w-full flex flex-col lg:flex-row justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-2">
          {/* back button */}
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
          {/* Page title */}
          <h1 className="font-poppins font-semibold text-3xl lg:text-4xl">
            Glossary
          </h1>
        </div>
      </div>

      {/* TODO: allign this with glossary!! */}
      <div className="px-16 py-6">
        <h1 className="font-poppins text-lg  text-gray-500 mb-8">
          Refer to the glossary below for definitions of common terminology used
          throughout the dashboard
        </h1>

        {/* Header Row */}
        <div
          className="grid grid-cols-2
          border-black pb-2 font-poppins 
          underline text-gray-500 text-xl"
        >
          <h3>Term</h3>
          <h3>Definition</h3>
        </div>

        {/* Rows */}
        <div className="font-poppins ">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-2 py-6 border-b border-black items-center"
            >
              <p className="text-xl">{item.term}</p>
              <p className="text-lg">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
