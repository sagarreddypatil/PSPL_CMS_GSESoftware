import socket
import time
import struct
from math import sin, pi
from random import random
# Basic Data Struct

start = time.time()
def signal():
    i = 0
    while True:
        yield(sin(i * pi / 180) + random() * 0.1)
        time.sleep(0.01)


# with open("test.bin", "wb") as f:
#     f.write(bytes)
with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
    s.connect(("localhost", 8094))
    for x in signal():
        # print(x)
        bytes = struct.pack("<2sfHQ", b"PT", x, 1, time.time_ns())
        print(''.join(format(x, '02x') for x in bytes))
        s.send(bytes)
    