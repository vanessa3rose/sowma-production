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
    <div className="w-[170px] h-[40px] opacity-100 flex flex-row items-center justify-start space-x-4 bg-white">
      <input
        type="checkbox"
        id={`${name.toLowerCase()}-checkbox`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-[28px] h-[28px] opacity-100 rounded-[4px] bg-white shadow-[inset_0_0_0_1px_#A9A9A9] appearance-none checked:bg-black checked:border-transparent checked:shadow-none focus:ring-0"
      />
      <label
        htmlFor={`${name.toLowerCase()}-checkbox`}
        className="w-[132.28px] h-[40px] opacity-100 flex items-center justify-start bg-white text-black font-inter font-medium text-[18px] leading-[39.6px] tracking-[0px]"
      >
        {name}
      </label>
    </div>
  );
}
