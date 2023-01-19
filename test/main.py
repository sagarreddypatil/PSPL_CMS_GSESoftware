import socket
import time
import struct
from math import sin, pi
from random import random
# Basic Data Struct

start = time.time_ns()
def signal():
    while True:
        timeDiff = time.time_ns() - start
        yield (sin(timeDiff * 2 * pi / 1000000000))


# with open("test.bin", "wb") as f:
#     f.write(bytes)
with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
    s.connect(("localhost", 8094))
    for x in signal():
        bytes = struct.pack("<I6fQ", 0xCAFE0000, x,x,x,x,x,x, time.time_ns())
        print(''.join(format(x, '02x') for x in bytes))
        s.send(bytes)
    