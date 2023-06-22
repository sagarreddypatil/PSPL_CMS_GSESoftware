export default function Nav({ children }: { children: React.ReactNode }) {
  return (
    <nav className="bg-moondust dark:bg-night-sky h-11">
      <div className="h-full px-2 flex flex-row justify-between items-center">
        {children}
      </div>
    </nav>
  );
}
