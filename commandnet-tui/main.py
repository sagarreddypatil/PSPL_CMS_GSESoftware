from enum import Enum
import msgpack
import socket

"""
typedef enum {
  EXEC_CMD = 1,
  ALL_CMDS,
  SET_VAR,
  GET_VAR,
  ALL_VARS,
} cmdnet_req_t;
"""


class CmdNetReq(Enum):
    EXEC_CMD = 1
    ALL_CMDS = 2
    SET_VAR = 3
    GET_VAR = 4
    ALL_VARS = 5


"""
typedef enum {
  CMD_SUCCESS  = 0,
  CMD_NOTFOUND = -1,
  CMD_INVALID  = -2,
  CMD_ERROR    = -3,
} cmdnet_status_t;
"""


class CmdNetReq(Enum):
    CMD_SUCCESS = 0
    CMD_NOTFOUND = -1
    CMD_INVALID = -2
    CMD_ERROR = -3


host = "192.168.2.50"
port = 8080


while True:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((host, port))
    except:
        continue

    print("Connected to server")

    # message = msgpack.packb([3, "lox_run", 0])
    message = msgpack.packb([5])
    print(f"sending: {message}")
    sock.send(message)

    data = sock.recv(1024)
    # print(f"received: {data}")
    data = msgpack.unpackb(data)

    while sock.recv(1) != b"":
        pass

    sock.close()

    # sock.shutdown(socket.SHUT_RDWR)
    print(data)
