import { createContext } from "react";

export const FullscreenContext = createContext<{
  fullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;
  // @ts-ignore
}>(undefined);
