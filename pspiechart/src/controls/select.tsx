import { useId } from "react";

interface SelectProps {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
}

export default function Select(props: SelectProps) {
  const id = useId();

  return (
    <div className="flex">
      <input
        type="checkbox"
        className="peer hidden"
        id={id}
        checked={props.checked}
        // onChange={(e) => props.onChange?.(e.target.checked)}
      />
      <label
        htmlFor={id}
        className={`select-none cursor-pointer rounded-none outline outline-1 hover:outline-2 outline-rush bg-white dark:bg-gray-900 dark:text-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm peer-checked:outline-none peer-checked:bg-rush peer-checked:text-black ${props.className}`}
        onClick={() => props.onChange?.(!props.checked)}
      >
        {props.children}
      </label>
    </div>
  );
}
