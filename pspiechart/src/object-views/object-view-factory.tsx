import { useParams } from "react-router-dom";
import { useContext } from "react";
import { IdentifierType, IOContext } from "../contexts/io-context";
import UPlotChart from "../components/uplotchart";

export default function ObjectViewFactory() {
  const params = useParams<IdentifierType>();
  const { dataSources } = useContext(IOContext);

  const dataSource = dataSources.find(
    (source) =>
      source.identifier.namespace === params.namespace &&
      source.identifier.id === params.id
  );

  if (!dataSource) return <h1>Not found</h1>; // todo: 404 page

  return (
    <UPlotChart
      dataSource={dataSource}
      key={123}
      pointsPerPixel={2}
      title={dataSource.identifier.name}
    />
  );
}
