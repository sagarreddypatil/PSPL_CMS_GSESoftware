import msgpack
import socket
import time


host = "192.168.2.50"
port = 8106
TIMEOUT = 1


def cmdnet_send(cmd):
    start = time.time()
    while True:
        if time.time() - start > TIMEOUT:
            raise Exception("Timeout")
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

    print(recvd)

    resp = msgpack.unpackb(recvd)
    sock.close()

    return resp


if __name__ == "__main__":
    while True:
        raw_cmd = input("Command>")
        raw_cmd = raw_cmd.split(" ")
        # for each item, try to convert to int
        cmd = []
        for item in raw_cmd:
            if not item:
                continue
            try:
                cmd.append(int(item))
            except:
                cmd.append(item)

        try:
            resp = cmdnet_send(cmd)
        except:
            resp = "Timeout"
        print(resp)
