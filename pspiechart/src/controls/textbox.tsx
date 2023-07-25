export default function Textbox({
  value,
  setValue,
  className,
}: {
  className?: string;
  value?: string;
  setValue?: (value: string) => void;
}) {
  return (
    <input
      type="text"
      className={`rounded-none border border-rush dark:bg-night-sky ${className}`}
      value={value}
      onChange={(e) => setValue?.(e.target.value)}
    />
  );
}
