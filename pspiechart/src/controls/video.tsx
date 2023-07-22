import { useEffect, useRef } from "react";

export default function Video() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = 5;
  }, []);

  return (
    <video
      ref={videoRef}
      className="h-full object-cover"
      src="/PSP Livestream Standby-Still BG.mp4"
      loop
      autoPlay
    ></video>
  );
}
