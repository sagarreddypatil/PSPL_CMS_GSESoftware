import { Parser } from "binary-parser";

const packetParser = new Parser()
  .string("type", { length: 4 })
  .uint16le("id")
  .array("_", {
    // pad bytes
    type: "uint8",
    length: 2,
  })
  .uint64le("time_us")
  .uint64le("counter")
  .int64le("value");

export { packetParser };
