"""
Abstraction of an SensorNet source
"""

import socket
import struct
from threading import Thread

UDP_MAX_SIZE = 65535


class Device(object):
    def __init__(self, ip: str, port: int):
        # Code plagarized from: https://stackoverflow.com/questions/603852/how-do-you-udp-multicast-in-python

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        self.socket.bind((ip, port))
        mreq = struct.pack("4sl", socket.inet_aton(ip), socket.INADDR_ANY)
        self.socket.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

        self.packets = []

    def start(self) -> Thread:
        t = Thread(target=self.run)
        t.start()

        return t

    def run(self):
        while True:
            data, addr = self.socket.recvfrom(UDP_MAX_SIZE)
            # self.packets.append(data)
            print(data)


if __name__ == "__main__":
    d = Device("239.1.2.3", 6969)
    # t = d.start()
    # t.join()
    d.run()
