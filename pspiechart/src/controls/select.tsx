"use client";

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
        onChange={(e) => props.onChange?.(e.target.checked)}
      />
      <label
        htmlFor={id}
        className={`select-none cursor-pointer rounded-sm outline outline-1 hover:outline-2 outline-rush px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm peer-checked:outline-none peer-checked:bg-rush ${props.className}`}
      >
        {props.children}
      </label>
    </div>
  );
}