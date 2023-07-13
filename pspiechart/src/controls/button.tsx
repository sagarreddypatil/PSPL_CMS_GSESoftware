import { useState } from "react";

interface ButtonProps {
  name: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Button(props: ButtonProps) {
  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className={`rounded-sm bg-rush px-3 py-1 text-sm font-semibold text-black shadow-sm hover:bg-rush-dark ${props.className}`}
          onClick={props.onClick}
        >
          {props.name}
        </button>
      </div>
    </div>
  );
}
