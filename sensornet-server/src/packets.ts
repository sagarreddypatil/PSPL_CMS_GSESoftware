import { Parser } from "binary-parser";

const packetParser = new Parser()
    .endianess("little")
    .string("type", { length: 6 })
    .uint16("id")
    .uint64("timestamp")
    .uint64("counter")
    .int64("data");

export {packetParser}
