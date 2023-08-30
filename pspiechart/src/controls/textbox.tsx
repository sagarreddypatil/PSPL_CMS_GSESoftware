import { forwardRef } from "react";

export default forwardRef(
  (
    {
      value,
      placeholder,
      setValue,
      onSubmit,
      onBlur,
      className,
    }: {
      className?: string;
      value?: string;
      placeholder?: string;
      setValue?: (value: string) => void;
      onBlur?: () => void;
      onSubmit?: () => void;
    },
    ref: React.Ref<HTMLInputElement>
  ) => {
    return (
      <input
        type="text"
        className={`rounded-none border border-rush dark:bg-night-sky px-2 ${className}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          e.preventDefault();
          setValue?.(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
          }
        }}
        onBlur={onBlur}
        ref={ref}
      />
    );
  }
);
