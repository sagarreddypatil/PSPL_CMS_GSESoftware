export function NavTitle({ children }: { children: React.ReactNode }) {
  return <div className="">{children}</div>;
}

export function NavSegment({ children }: { children: React.ReactNode }) {
  return <div className="d-flex nav-segment">{children}</div>;
}

export default function Navbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav
      className={`navbar navbar-expand-lg sticky-top navbar-dark bg-black mb-2 ${className}`}
    >
      <div className="d-flex justify-content-between align-items-center px-2 flex-fill">
        {children}
      </div>
    </nav>
  );
}
