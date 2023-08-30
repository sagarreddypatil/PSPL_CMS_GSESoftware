import { useContext } from "react";
import { DarkModeContext } from "../App";
import { useNavigate } from "react-router-dom";

export default function Logo() {
  const darkMode = useContext(DarkModeContext);

  const navigate = useNavigate();

  return (
    <button onClick={() => navigate("/item/root")}>
      {darkMode ? (
        <img src="/PSP-2Color-Reversed.svg" className="h-7" alt="Logo" />
      ) : (
        <img src="/PSP-2Color.svg" className="h-7" alt="Logo" />
      )}
    </button>
  );
}
