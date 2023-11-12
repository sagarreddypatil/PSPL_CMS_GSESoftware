import { Button } from "../controls/button";
import { UserItemProps } from "./item-view-factory";
import { IOContext } from "../contexts/io-context";
import { useContext } from "react";

export function RpcButton({ item }: UserItemProps) {
  const { remoteCalls } = useContext(IOContext);

  const [namespace, id] = item.id.split(":");
  const remoteCall = remoteCalls.find(
    (call) => call.identifier.namespace == namespace && call.identifier.id == id
  );

  return (
    <Button
      className="grow m-2 text-[24px] self-stretch"
      onClick={() => remoteCall?.call()}
    >
      {item.name}
    </Button>
  );
}
