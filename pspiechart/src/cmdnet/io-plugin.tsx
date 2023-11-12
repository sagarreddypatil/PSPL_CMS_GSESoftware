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
          // device

          fetch(`http://${CMDNET_SERVER}/devices/${device}/variables`)
            .then((res) => res.json())
            .then((variables: string[]) => {
              variables.map((variable) => {
                addConfigOption({
                  identifier: {
                    namespace: `CmdNet-${device}`,
                    id: variable,
                  },
                  getValue: async () => {
                    const res = await fetch(
                      `http://${CMDNET_SERVER}/devices/${device}/variables/${variable}`
                    );
                    return res.json();
                  },
                  setValue: async (value) => {
                    const res = await fetch(
                      `http://${CMDNET_SERVER}/devices/${device}/variables/${variable}/set/${value}`,
                      {
                        method: "PUT",
                        body: JSON.stringify(value),
                      }
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
                    namespace: `CmdNet-${device}`,
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
