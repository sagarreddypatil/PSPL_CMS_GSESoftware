import socket
import struct
import random
import math
import time
from random import gauss as randnorm


"""
Packet Format
    H: Sensor ID (u16)
    2x: Padding bytes (4-byte aligned)
    Q: Timestamp (u64 microseconds)
    Q: Counter (u64)
    q: Data (i64)
"""
packet_format = "<H 6x Q Q q"
fmt_compiled = struct.Struct(packet_format)


def make_packet(
    header: bytes, sensor_id: int, timestamp: int, counter: int, data: int
) -> bytes:
    return fmt_compiled.pack(sensor_id, timestamp, counter, data)


# Create a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Server IP address and port
server_ip = "127.0.0.1"
server_port = 5555

ids = list(range(1, 6))
counters = [0 for a in range(ids[-1] + 1)]
datas = [0 for a in range(ids[-1] + 1)]

rate = 1000  # Hz

# start = time.time() # to test what would happen if time started at zero
start = 0


def better_sleep(sleep_time):
    time.sleep(sleep_time)
    # start = time.time()
    # while time.time() - start < sleep_time:
    #     pass


last = time.time()
while True:
    for sensor_id in ids:
        if sensor_id == 0:
            continue
        counter = counters[sensor_id]
        counter = counters[sensor_id] = counter + 1

        datas[sensor_id] += randnorm(0, 1) * 100 / rate
        # data = datas[sensor_id] + math.sin(time.time() * 3) * 1000
        data = datas[sensor_id] * 10
        # datas[sensor_id] = data = math.sin(time.time() * 3 + sensor_id * math.pi / 2) * 1000

        timestamp = int((time.time() - start) * 1000 * 1000)  # microseconds
        data = int(data)
        packet = make_packet(b"SEN", sensor_id, timestamp, counter, data)
        # time.sleep(1)

        sock.sendto(packet, (server_ip, server_port))

    diff = time.time() - last
    sleepval = (1 / rate) - diff
    if sleepval > 0:
        better_sleep(sleepval)
    diff = time.time() - last
    # print(f"Rate: {1 / (max(0.00001, diff))} Hz")
    last = time.time()
