"use client";

import { useId, useState } from "react";

interface DropdownProps {
  name: React.ReactNode;
  children: React.ReactNode;
  right?: boolean;
}

export function Dropdown(props: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="rounded-sm bg-rush px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-rush-dark"
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          {props.name}
        </button>
      </div>
      <div
        className={`absolute ${
          props.right ? "right-0" : ""
        } z-10 mt-2 w-44 origin-top-left rounded-sm bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        hidden={!open}
      >
        <div className="py-1">{props.children}</div>
      </div>
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export function DropdownItem(props: DropdownItemProps) {
  const classes =
    "text-gray-700 block w-full text-left px-2 py-1 text-sm hover:bg-rush-light hover:font-bold focus:bg-gray-200";
  const activeClases = "bg-rush-light font-bold";
  const className = props.active ? `${classes} ${activeClases}` : classes;
  return (
    <button
      className={className}
      disabled={props.active}
      onMouseDown={props.onClick}
    >
      {props.children}
    </button>
  );
}
