export default function Landing() {
  return (
    <div className="overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className=""
        style={{
          position: "relative",
          minWidth: "100%",
          minHeight: "100%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <source src="landing.mp4" />
      </video>
    </div>
  );
}
