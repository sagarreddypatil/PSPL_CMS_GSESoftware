"use client";

import { useId } from "react";

interface SelectProps {
  children: React.ReactNode;
}

export default function Select({ children }: SelectProps) {
  const id = useId();

  return (
    <>
      <input type="checkbox" className="peer hidden" id={id} />
      <label
        htmlFor={id}
        className="select-none cursor-pointer rounded-sm outline outline-1 hover:outline-2 outline-rush px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm peer-checked:outline-none peer-checked:bg-rush"
      >
        {children}
      </label>
    </>
  );
}
