import "./globals.css";
import { IBM_Plex_Sans } from "next/font/google";

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
        {children}
      </body>
    </html>
  );
}
