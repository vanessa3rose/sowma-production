type SmallCardProps = {
  title: string;
  positionClassName: string;
};
// A small card component with a title and customizable position
export default function SmallCard({
  title,
  positionClassName,
}: SmallCardProps) {
  return (
    <div
      title={title}
      className={`absolute w-[200px] h-[130px] bg-[#ffffff] border-[1px] border-[#E5E5E5] rounded-[12px] shadow-md ${positionClassName}`}
    >
      <div className="relative h-full w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="absolute top-[5px] right-[12px] w-[15px] h-[15px] pointer-events-none"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
        <p className="font-poppins font-medium text-[16px] color-[#000000] mt-[12px] ml-[20px]">
          {title}
        </p>
      </div>
    </div>
  );
}
