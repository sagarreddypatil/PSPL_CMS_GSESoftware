export default function Banner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <span className="text-4xl font-bold text-rush">{text}</span>
    </div>
  );
}
