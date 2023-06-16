"use client";

import { useState } from "react";

interface DropdownProps {
  children: React.ReactNode;
}

export function Dropdown(props: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="rounded-md bg-rush px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-rush-dark"
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          Create
        </button>
      </div>
      <div
        className="absolute z-10 mt-2 w-44 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        hidden={!open}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabIndex={-1}
      >
        <div className="py-1" role="none">
          {props.children}
        </div>
      </div>
    </div>
  );
}

export function DropdownItem() {
  return (
    <button
      className="text-gray-700 block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 focus:bg-gray-200"
      role="menuitem"
      tabIndex={-1}
    >
      Account settings
    </button>
  );
}
