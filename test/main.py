import socket
import time
import struct
from math import sin, pi
from random import randint
# Basic Data Struct

start = time.time()
def signal():
    i = 0
    while True:
        yield(randint(0, 1000))
        time.sleep(0.01)


# with open("test.bin", "wb") as f:
#     f.write(bytes)
with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
    s.connect(("localhost", 5000))
    i = 0
    for x in signal():
        # print(x)
        bytes = struct.pack("<4sHQQi", b"SEN", 1, time.time_ns(), i, x)
        # print(''.join(format(x, '02x') for x in bytes))
        s.send(bytes)
        i += 1
    