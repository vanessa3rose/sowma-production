export interface LoginTextBoxProps {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}

export default function LoginTextBox({
  label,
  placeholder = "",
  type = "text",
  icon,
}: LoginTextBoxProps) {
  return (
    <div className="flex flex-col items-start w-[577px] gap-[6.4px]">
      {/* Label */}
      <label className="font-poppins text-[24px] leading-[48px] font-normal text-[#7B7C7C]">
        {label}
      </label>

      {/* Input container */}
      <div className="flex items-center justify-between w-full h-[76px] border-[2px] border-[#5286D1] rounded-[36px] px-[32px]">
        {/* Input field */}
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 h-full bg-transparent text-[25.6px] font-poppins text-[#000000] font-normal placeholder:text-[#000000] placeholder:font-poppins placeholder:text-[25.6px] placeholder:font-normal focus:outline-none"
        />

        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 flex items-center justify-center w-[24px] h-[24px] ml-[12px]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
