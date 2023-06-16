import "./globals.css";
import { IBM_Plex_Sans } from "next/font/google";
import { Dropdown, DropdownItem } from "./components/dropdown";
import ObjectTree from "./components/object-tree";
import VertLayout from "./components/vert-layout";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "600"],
  subsets: ["latin"],
});

export const metadata = {
  title: "PSPieChart",
  description: "PSP Mission Control",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${ibmPlexSans.className} bg-white dark:bg-black text-black dark:text-white h-full leading-none flex flex-col`}
      >
        <nav className="bg-moondust dark:bg-night-sky">
          <div className="w-full p-2 flex flex-wrap items-center justify-between">
            <div className="flex items-center">
              <Dropdown>
                <DropdownItem />
                <DropdownItem />
                <DropdownItem />
                <DropdownItem />
                <DropdownItem />
              </Dropdown>
            </div>
            <div className="flex items-center">
              <img src="/PSP-2Color.svg" className="h-10" alt="Logo" />
            </div>
            <div className="flex items-center">
              <img src="/PSP-2Color.svg" className="h-10" alt="Logo" />
            </div>
          </div>
        </nav>
        <main className="flex-1">
          <VertLayout left={<ObjectTree />}>{children}</VertLayout>
        </main>
      </body>
    </html>
  );
}
