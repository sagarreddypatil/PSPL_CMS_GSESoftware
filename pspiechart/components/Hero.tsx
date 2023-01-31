interface HeroProps {
  title: string;
  text?: string;
}

export default function Hero(props: HeroProps) {
  return (
    <div className="bg-dark text-primary m-auto px-4 py-5 text-center">
      <div className="py-5">
        <h1 className="display-5 fw-bold text-primary">{props.title}</h1>
        <div className="mx-auto">
          <p className="fs-5 mb-4 text-white">{props.text}</p>
        </div>
      </div>
    </div>
  );
}
