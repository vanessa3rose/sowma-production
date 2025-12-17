interface CheckboxTitleProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function CheckboxTitle({
  name,
  checked,
  onChange,
}: CheckboxTitleProps) {
  return (
    <div className="opacity-100 flex flex-row items-center justify-start bg-white">
      <div className="flex items-center space-x-4">
        <div className="relative w-[28px] h-[28px]">

          {/* checkbox */}
          <input
            type="checkbox"
            id={`${name.toLowerCase()}-checkbox`}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="w-full h-full opacity-0 absolute top-0 left-0 cursor-pointer"
          />

          {/* checkmark if checked */}
          <div className={`w-full h-full rounded-[4px] shadow-[inset_0_0_0_1px_#A9A9A9] flex items-center justify-center ${checked ? 'bg-sowma-blue shadow-none' : ''}`}>
            {checked && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
          </div>
        </div>

        {/* label for social media type */}
        <label
          htmlFor={`${name.toLowerCase()}-checkbox`}
          className="ml-2 opacity-100 flex items-center justify-start bg-white text-black font-inter font-medium text-[18px] leading-[39.6px] tracking-[0px] cursor-pointer"
        >
          {name}
        </label>
      </div>
    </div>
  );
}
