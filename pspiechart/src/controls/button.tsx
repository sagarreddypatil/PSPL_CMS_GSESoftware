import { twMerge } from "tailwind-merge";

interface ButtonProps {
  name?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button(props: ButtonProps) {
  return (
    <button
      type="button"
      // className={`rounded-none bg-rush px-3 py-1 text-sm font-semibold text-black shadow-sm hover:bg-rush-dark ${props.className}`}
      className={twMerge('rounded-none bg-rush px-3 py-1 text-sm font-semibold text-black shadow-sm hover:bg-rush-dark truncate', props.className)}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.name}
      {props.children}
    </button>
  );
}
