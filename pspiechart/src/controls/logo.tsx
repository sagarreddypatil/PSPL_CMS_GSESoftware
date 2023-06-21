import { useContext } from "react";
import { DarkModeContext } from "../App";

export default function Logo() {
  const darkMode = useContext(DarkModeContext);

  return (
    <>
      {darkMode ? (
        <img src="/PSP-2Color-Reversed.svg" className="h-7" alt="Logo" />
      ) : (
        <img src="/PSP-2Color.svg" className="h-7" alt="Logo" />
      )}
    </>
  );
}
