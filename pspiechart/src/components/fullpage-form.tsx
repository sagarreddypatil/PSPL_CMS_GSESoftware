import React from "react";

export default function FullpageForm({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="bg-night-sky w-full h-full justify-items-center flex flex-col">
        <div className="bg-white outline outline-rush w-full h-full sm:h-auto sm:w-72 m-auto p-4 flex flex-col gap-4">
          {children}
        </div>
      </div>
    </>
  );
}
