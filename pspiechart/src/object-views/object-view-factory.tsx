import { useParams } from "react-router-dom";
import { useContext } from "react";
import { IdentifierType, IOContext } from "../io-context";
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
      paused={false}
      size={{ width: 800, height: 400 }}
      timespan={10}
      dataSource={dataSource}
      key={123}
      pointsPerPixel={1}
      title="test"
    />
  );
}
