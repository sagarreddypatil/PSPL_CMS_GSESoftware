import { useState, useEffect } from "react";
import Textbox from "../controls/textbox";
import { UserItemProps } from "./item-view-factory";
import { Button } from "../controls/button";
import { FiX } from "react-icons/fi";

const myURL = new URL(window.location.href);
myURL.port = "8080";
const CMDNET_SERVER = myURL.host;

enum CmdNetFieldTypes {
    int = "int",
    string = "string"
}

type CmdNetField = {
    name: string;
    type: CmdNetFieldTypes;
};

type CmdNetCommand = {
    device: string;
    name: string;
    params: CmdNetField[];
};

// #region Command Parsing

function expectName(command: string) {
    const match = command.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (match) {
        return [match[0], command.substring(match[0].length)];
    }

    else throw new Error("Expected name");
}

function expectWhitespace(command: string) {
    const match = command.match(/^\s+/);
    if (match) {
        return command.substring(match[0].length);
    }

    else throw new Error("Expected whitespace");
}

function expectColon(command: string) {
    const match = command.match(/^:/);
    if (match) {
        return command.substring(match[0].length);
    }

    else throw new Error("Expected colon");
}

function parseCommand(command: string)  {
    let current = command;

    const [device, rest] = expectName(current);
    current = rest;

    current = expectWhitespace(current);

    const [name, rest1] = expectName(current);
    current = rest1;

    const params: CmdNetField[] = [];

    while (current.length > 0) {
        current = expectWhitespace(current);

        const [paramName, rest] = expectName(current);
        current = rest;

        current = expectColon(current);

        const [paramType, rest1] = expectName(current);
        current = rest1;

        if (paramType !== CmdNetFieldTypes.int && paramType !== CmdNetFieldTypes.string) {
            throw new Error("Invalid parameter type, can be int or string");
        }

        params.push({ name: paramName, type: paramType as CmdNetFieldTypes });
    }

    return { device, name, params } as CmdNetCommand;
}

// #endregion

function CmdNetField({ field, setValue }: { field: CmdNetField; setValue: (value: string | number) => void }) {
    const numeric = field.type === CmdNetFieldTypes.int;

    const onValue = (value: string) => {
        if (numeric) setValue(parseInt(value));
        else setValue(value);
    }

    return <Textbox placeholder={field.name} numeric={numeric} setValue={onValue} />;
}

export function CmdNetButton({ item }: UserItemProps) {
    let command: CmdNetCommand | null = null;

    try {
        command = parseCommand(item.name);
    } catch (e) {
        console.error(e);
    }

    const [paramStates, setParamStates] = useState<(string | number)[]>([]);
    const [askConfirm, setAskConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resp, setResp] = useState<string | null>(null);

    useEffect(() => {
        if (command === null) return;

        fetch(`http://${CMDNET_SERVER}/devices`).then(res => res.json())
        .then((devices: string[]) => {
            if (!devices.includes(command!.device)) {
                setError("Device not found");
            }
        }).catch(e => {
            setError("Failed to fetch devices");
        });
    }, [item]);

    useEffect(() => {
        // reset when switch is opened
        if(askConfirm) setResp(null);
    }, [askConfirm]);

    if (command === null) return <span className="text-red-500">Parser Error</span>
    if (error !== null) return <span className="text-red-500">{error}</span>

    const validateParams = () => {
        if (paramStates.length !== command!.params.length)
            return false;

        for(const value of paramStates) {
            if (value == "" || value == null) {
                alert("Some/all params empty");
                return false;
            }
        }

        return true;
    }

    const onExecute = () => {
        if (!validateParams()) return;

        setResp("Executing...");
        fetch(`http://${CMDNET_SERVER}/devices/${command!.device}/${command!.name}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paramStates)
        }).then(res => res.text()).then((data: string) => {
            setResp(data);
        }).catch(e => {
            console.error(e);
            setResp("Error");
        }).then(() => {
            setAskConfirm(false);
        });
    };

    const onInitialClick = () => {
        if (!validateParams()) return;
        setAskConfirm(true);
    }

    const setParam = (i: number) => {
        return (value: string | number) => {
            setParamStates(old => {
                const copy = [...old];
                copy[i] = value;
                return copy;
            });
        }
    }

    return (
        <div className="flex flex-col gap-1 p-2 pt-0 w-full">
            <span className="self-start mt-0">Device {command.device}</span>
            {command.params.map((param, i) => (
                <CmdNetField key={i} field={param} setValue={setParam(i)} />
            ))}
            {askConfirm ?
                <div className="flex flex-row gap-1 justify-between">
                    <Button onClick={onExecute} className="bg-green-600 text-white hover:bg-green-800">Execute</Button>
                    <Button onClick={() => setAskConfirm(false)} className="bg-red-600 text-white hover:bg-red-800"><FiX /></Button>
                </div> :
                <Button onClick={onInitialClick}>{command.name}</Button>
            }
            <span className="self-start">{ resp ? resp : "Awaiting Input" }</span>
        </div>
    );
}

export function CmdNetButtonTreeItem({ item }: UserItemProps) {
}