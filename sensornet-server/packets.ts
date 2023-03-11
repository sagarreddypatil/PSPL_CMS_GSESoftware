import { Parser } from "binary-parser";

const packetParser = new Parser()
    .endianess("little")
    .string("type", { length: 4, zeroTerminated: true, stripNull: true })
    .uint16("id")
    .uint64("timestamp")
    .uint64("counter")
    .int32("data");

export {packetParser}
