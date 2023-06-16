import socket
import struct
import random
import math
import time
import numpy as np


def randnorm(mu, sigma):
    return np.random.normal(mu, sigma)


# Define the structure format
packet_format = "<4s 2x H Q Q q"
fmt_compiled = struct.Struct(packet_format)


def make_packet(
    header: bytes, sensor_id: int, timestamp: int, counter: int, data: int
) -> bytes:
    return fmt_compiled.pack(header, sensor_id, timestamp, counter, data)


# Create a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Server IP address and port
server_ip = "127.0.0.1"
server_port = 5001

ids = list(range(0, 6))
counters = [0 for a in ids]
datas = [0 for a in ids]

rate = 1000  # Hz


def better_sleep(sleep_time):
    start = time.time()
    while time.time() - start < sleep_time:
        pass


last = time.time()
while True:
    timestamp = int(time.time() * 1000 * 1000)  # microseconds

    for sensor_id in ids:
        if sensor_id == 0:
            continue
        counter = counters[sensor_id]
        counter = counters[sensor_id] = counter + 1

        datas[sensor_id] += randnorm(0, 1) / rate

        data = int(datas[sensor_id] * 1000)
        packet = make_packet(b"SEN", sensor_id, timestamp, counter, data)

        sock.sendto(packet, (server_ip, server_port))

    diff = time.time() - last
    sleepval = (1 / rate) - diff
    if sleepval > 0:
        better_sleep(sleepval)
    diff = time.time() - last
    print(f"Rate: {1 / (max(0.00001, diff))} Hz")
    last = time.time()
