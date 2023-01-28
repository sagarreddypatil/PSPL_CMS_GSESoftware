export default function Button({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <button className="btn btn-danger flex-fill m-2" onClick={onClick}>
      <h1 className="mb-0">{name}</h1>
    </button>
  );
}
