from enum import Enum
import msgpack
import socket
import time


class RequestType(Enum):
    EXEC_CMD = 1
    ALL_CMDS = 2
    SET_VAR = 3
    GET_VAR = 4
    ALL_VARS = 5


class ResponseType(Enum):
    CMD_SUCCESS = 0
    CMD_NOTFOUND = -1
    CMD_INVALID = -2
    CMD_ERROR = -3


vars = {
    "var1": 1,
    "var2": 2,
    "var3": 3,
}

cmds = {
    "cmd1": lambda: print("cmd1"),
    "cmd2": lambda: print("cmd2"),
    "cmd3": lambda: print("cmd3"),
}


HOST = "0.0.0.0"
PORT = 1234


def main():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            while True:
                try:
                    sock.bind((HOST, PORT))
                    break
                except:
                    pass
            print(f"Listening on {HOST}:{PORT}")
            sock.listen()

            while True:
                conn, addr = sock.accept()
                try:
                    print(f"Conneceted to {addr}")
                    data = conn.recv(1024)

                    unpacked = msgpack.unpackb(data)
                    command = unpacked[0]

                    resp = []

                    if command == RequestType.ALL_CMDS.value:
                        resp = [ResponseType.CMD_SUCCESS.value, list(cmds.keys())]
                    elif command == RequestType.ALL_VARS.value:
                        resp = [ResponseType.CMD_SUCCESS.value, list(vars.items())]
                    elif command == RequestType.GET_VAR.value:
                        key = unpacked[1]
                        if key not in vars:
                            resp = [ResponseType.CMD_NOTFOUND.value]
                        else:
                            resp = [ResponseType.CMD_SUCCESS.value, vars[key]]
                    elif command == RequestType.SET_VAR.value:
                        key = unpacked[1]
                        value = unpacked[2]
                        if key not in vars:
                            resp = [ResponseType.CMD_NOTFOUND.value]
                        else:
                            oldval = vars[key]
                            vars[key] = value
                            resp = [ResponseType.CMD_SUCCESS.value, oldval]
                    elif command == RequestType.EXEC_CMD.value:
                        key = unpacked[1]
                        if key not in cmds:
                            resp = [ResponseType.CMD_NOTFOUND.value]
                        else:
                            cmds[key]()
                            resp = [ResponseType.CMD_SUCCESS.value]
                    else:
                        resp = [ResponseType.CMD_INVALID.value]

                    print(f"sending {resp}")
                    conn.sendall(msgpack.packb(resp))

                finally:
                    conn.close()
    except KeyboardInterrupt:
        print("Exiting")


if __name__ == "__main__":
    main()
