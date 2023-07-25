import { forwardRef } from "react";

export default forwardRef(
  (
    {
      value,
      setValue,
      onSubmit,
      onBlur,
      className,
    }: {
      className?: string;
      value?: string;
      setValue?: (value: string) => void;
      onBlur?: () => void;
      onSubmit?: () => void;
    },
    ref: React.Ref<HTMLInputElement>
  ) => {
    return (
      <input
        type="text"
        className={`rounded-none border border-rush dark:bg-night-sky ${className}`}
        value={value}
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
