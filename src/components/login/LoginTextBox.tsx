export interface LoginTextBoxProps {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  value?: string;
  width?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode; //to pass components into login textbox
}
export default function LoginTextBox({
  label,
  placeholder = "",
  type = "text",
  icon,
  value,
  width,
  onChange,
  children, 
}: LoginTextBoxProps) {
  const widthClass = width ? width : "w-[577px]"; // the default width if not specified
  return (
    <div className={`flex flex-col items-start gap-[6.4px] ${widthClass}`}>
      {/* Label */}
      <label className="font-poppins text-[24px] leading-[48px] font-normal text-[#000000]">
        {label}
      </label>
      {/* Input container */}
      <div className="flex items-center justify-between w-full h-[76px] border-[2px] border-[#5286D1] rounded-[36px] px-[32px]">
        {/* uses children/component if exists, if not does input */}
        {children ? (
          <div className="flex flex-1 items-center justify-around w-full h-full">
            {children}
          </div>
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="flex-1 h-full bg-transparent text-[25.6px] font-poppins text-black placeholder:text-gray-400 placeholder:font-poppins placeholder:text-[25.6px] placeholder:font-normal focus:outline-none"
          />
        )}
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




