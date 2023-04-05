import "../styles/App.scss";
import "@fontsource/libre-franklin";
import "@fontsource/saira";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import { FullscreenContext } from "../contexts/FullscreenContext";
import { WebSocketContext } from "../contexts/WebsocketContext";
import { useEffect, useState, createContext } from "react";
import sizeMe from "react-sizeme";
import { WebsocketHandler } from "../handlers/WebsocketHandler";

sizeMe.noPlaceholders = true;

export default function App({ Component, pageProps }: AppProps) {
  const [fullscreen, setFullscreen] = useState(false);    
  const [websocketHandler, setWebSocketHandler] = useState(new WebsocketHandler());

  websocketHandler.on("pressureTransducer", (data) => {
    console.log("pressureTransducer", data);
  });

  useEffect(() => { // TODO: Make this url an environment variable
    const ws = new WebSocket(process.env.SENSORNET_URL + "/data");
    websocketHandler.connect(ws);
  }, [websocketHandler]);

  return (
    <Layout>
      <WebSocketContext.Provider value={{websocket: websocketHandler, setWebSocket: setWebSocketHandler}}>
      <FullscreenContext.Provider value={{ fullscreen, setFullscreen }}>
        {fullscreen ? null : <Sidebar />}
        <Component {...pageProps} />
      </FullscreenContext.Provider>
      </WebSocketContext.Provider>
    </Layout>
  );

  // return <Component {...pageProps} />;
}
