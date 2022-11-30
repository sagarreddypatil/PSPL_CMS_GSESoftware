import struct


class StructDecoder(object):
    """
    Example Schema File:
    < # specifies LE
    header b # specifies sensor
    x 3 # 3 pad bytes
    timestamp Q
    value h
    x 2 # 2 pad bytes
    """

    def __init__(self, schema: str):
        self.vars = []
        self.format_string = ""

        for line in schema.splitlines():
            line = line.split("#")[0]  # remove comments
            line = line.strip()

            if not line:
                continue

            line = line.split()
            if len(line) == 1:
                self.format_string += line[0]
            elif len(line) == 2:
                if line[0] == "x":
                    num_pad = int(line[1])
                    self.format_string += "x" * num_pad
                else:
                    self.vars.append(line[0])
                    self.format_string += line[1]
            else:
                raise ValueError("Invalid line: {}".format(line))

        print(self.vars)
        print(self.format_string)

    def decode(self, data: bytes) -> dict:
        values = struct.unpack(self.format_string, data)
        return dict(zip(self.vars, values))

    def size(self, data: bytes) -> int:
        return struct.calcsize(self.format_string)


if __name__ == "__main__":
    schema = """
    < # specifies LE
    header B # specifies sensor
    x 7
    time Q
    value h
    x 6
    """

    s = StructDecoder(schema)
    print(
        s.decode(
            b"\x20\x00\x00\x00\x00\x00\x00\x00\x31\xd4\x00\x00\x00\x00\x00\x00\xdb\x03\x65\x80\xfd\x7f\x00\x00"
        )
    )
