import socket
import msgpack
import time
from dataclasses import dataclass

TIMEOUT = 1


class CmdNetException(Exception):
    pass


@dataclass
class Device:
    host: str
    port: int


def cmdnet_send(device: Device, cmd: list):
    host = device.host
    port = device.port

    start = time.time()
    while True:
        if time.time() - start > TIMEOUT:
            raise CmdNetException("Device did not respond in time")
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(TIMEOUT)
            sock.connect((host, port))
            sock.settimeout(None)
            break
        except:
            continue

    message = msgpack.packb(cmd)
    sock.send(message)

    recvd = b""
    while True:
        data = sock.recv(1024)
        if not data:
            break
        recvd += data

    sock.close()

    try:
        resp = msgpack.unpackb(recvd)
    except:
        raise CmdNetException("Invalid response from device")

    return resp
