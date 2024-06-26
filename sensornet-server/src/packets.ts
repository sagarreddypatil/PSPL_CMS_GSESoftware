import { Parser } from "binary-parser";
const struct =  new Parser()
.uint16le("id")
.array("_", {
  // pad bytes
  type: "uint8",
  length: 6,
})
.uint64le("time_us")
.uint64le("counter")
.int64le("value");

const packetParser = new Parser().array("data", {
  type: struct,
  length: 32,
});

export { packetParser };
