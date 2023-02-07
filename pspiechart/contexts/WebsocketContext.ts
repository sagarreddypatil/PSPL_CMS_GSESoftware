import { createContext } from "react";
import { WebsocketHandler } from "../handlers/WebsocketHandler";

export const WebSocketContext = createContext<{
  websocket: WebsocketHandler;
  setWebSocket: (websocket: WebsocketHandler) => void;
  // @ts-ignore
}>(undefined);
