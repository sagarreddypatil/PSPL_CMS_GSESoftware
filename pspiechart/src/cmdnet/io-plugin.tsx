import { IOContext } from "../contexts/io-context";
import { useContext, useEffect } from "react";

const CMDNET_SERVER = import.meta.env.VITE_CMDNET_SERVER as string;

export default function CmdNetPlugin() {
  const { addConfigOption, addRemoteCall } = useContext(IOContext);

  useEffect(() => {
    // TODO change to HTTPS!!!
    fetch(`http://${CMDNET_SERVER}/devices`)
      .then((res) => res.json())
      .then((devices: string[]) => {
        devices.map((device) => {
          const namespace = `${device} CmdNet`;

          fetch(`http://${CMDNET_SERVER}/devices/${device}/variables`)
            .then((res) => res.json())
            .then((variables: string[]) => {
              variables.map((variable) => {
                addConfigOption({
                  identifier: {
                    namespace: namespace,
                    id: variable,
                  },
                  getValue: async () => {
                    const res = await fetch(
                      `http://${CMDNET_SERVER}/devices/${device}/variables/${variable}`
                    );
                    const json = await res.json();
                    return json.value;
                  },
                  setValue: async (value) => {
                    const res = await fetch(
                      `http://${CMDNET_SERVER}/devices/${device}/variables/${variable}/set/${value}`
                    );
                    return res.ok;
                  },
                });
              });
            });

          fetch(`http://${CMDNET_SERVER}/devices/${device}/instructions`)
            .then((res) => res.json())
            .then((instructions: string[]) => {
              instructions.map((instruction) => {
                addRemoteCall({
                  identifier: {
                    namespace: namespace,
                    id: instruction,
                  },
                  call: async () => {
                    const res = await fetch(
                      `http://${CMDNET_SERVER}/devices/${device}/instructions/${instruction}/call`
                    );
                    return res.ok;
                  },
                });
              });
            });
        });
      });
  }, []);

  return <></>;
}
