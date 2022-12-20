"""
Abstraction of an SensorNet source
"""

import socket
import struct
from threading import Thread

from conversion.sensor import SensorRegistry, SensorInfluxWriter
from .packet import PacketDecoder

from influxdb_client import WriteApi

UDP_MAX_SIZE = 65535


class Device(object):
    def __init__(self, name: str, ip: str, port: int, sensor_registry: SensorRegistry, write_api: WriteApi):
        # Code plagarized from: https://stackoverflow.com/questions/603852/how-do-you-udp-multicast-in-python

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        self.socket.bind((ip, port))
        mreq = struct.pack("4sl", socket.inet_aton(ip), socket.INADDR_ANY)
        self.socket.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

        self.decoder = PacketDecoder(name, sensor_registry)
        self.sensor_writer = SensorInfluxWriter(write_api)

    def start(self) -> Thread:
        t = Thread(target=self.run)
        t.start()

        return t

    def run(self):
        while True:
            data, addr = self.socket.recvfrom(UDP_MAX_SIZE)

            packet = self.decoder.decode(data)
