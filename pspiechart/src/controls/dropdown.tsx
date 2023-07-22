import { useState } from "react";

interface DropdownProps {
  name: React.ReactNode;
  children?: React.ReactNode;
  right?: boolean;
}

export function Dropdown(props: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="rounded-none bg-rush px-3 py-1 text-sm font-semibold text-black shadow-sm hover:bg-rush-dark"
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          {props.name}
        </button>
      </div>
      <div
        className={`absolute ${
          props.right ? "right-0" : ""
        } z-10 mt-2 w-44 origin-top-left rounded-none bg-moondust shadow-lg ring-1 ring-black ring-opacity-30 focus:outline-none dark:bg-night-sky dark:ring-white dark:ring-opacity-30`}
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
    "text-black block w-full text-left px-2 py-1 text-sm hover:bg-rush-light hover:font-bold focus:bg-gray-200 dark:hover:text-black";
  const activeClases = "bg-rush-light font-bold text-black dark:text-black";
  const inactiveClasses = "dark:text-white";
  const className = props.active
    ? `${classes} ${activeClases}`
    : `${classes} ${inactiveClasses}`;
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
