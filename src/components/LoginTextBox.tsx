export interface LoginTextBoxProps {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LoginTextBox({
  label,
  placeholder = "",
  type = "text",
  icon,
  value,
  onChange,
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
          value={value}
          onChange={onChange}
          className="flex-1 h-full bg-transparent text-[25.6px] font-poppins text-black placeholder:text-gray-400 placeholder:font-poppins placeholder:text-[25.6px] placeholder:font-normal focus:outline-none"
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
