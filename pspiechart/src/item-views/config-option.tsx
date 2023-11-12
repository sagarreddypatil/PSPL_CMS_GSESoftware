import { useContext, useEffect, useRef, useState } from "react";
import Textbox from "../controls/textbox";
import { UserItemProps } from "./item-view-factory";
import { IOContext } from "../contexts/io-context";
import { Button } from "../controls/button";

import { FiRefreshCw, FiArrowRight } from "react-icons/fi";

export function ConfigOption({ item }: UserItemProps) {
  const { configOptions } = useContext(IOContext);
  const [value, setValue] = useState<number | null>(null);
  const textboxRef = useRef<HTMLInputElement>(null);

  const [namespace, id] = item.id.split(":");
  const configOption = configOptions.find(
    (option) =>
      option.identifier.namespace === namespace && option.identifier.id === id
  );

  const reloadValue = () => {
    configOption?.getValue().then((value) => {
      setValue(value);
    });
  };

  const setValueRemote = () => {
    const value = parseFloat(textboxRef.current!.value);
    configOption?.setValue(value).then(() => {
      reloadValue();
    });
  };

  useEffect(() => {
    reloadValue();
  }, [item]);

  useEffect(() => {
    if (!value) return;
    textboxRef.current!.value = value.toString();
  }, [value]);

  return (
    <div className="flex flex-row gap-1">
      <Textbox ref={textboxRef} />
      <Button onClick={reloadValue}>
        <FiRefreshCw />
      </Button>
      <Button onClick={setValueRemote}>
        <FiArrowRight />
      </Button>
    </div>
  );
}
