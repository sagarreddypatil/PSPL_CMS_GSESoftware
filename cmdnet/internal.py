class FirmwareError(Exception):
    pass

class NotFoundError(FirmwarweError):
    pass

class InvalidError(FirmwareError):
    pass

class InternalError(FirmwareError):
    pass

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

def cmdnet_send(cmd):
    start = time.time()
    while True:
        if time.time() - start > timeout:
            raise Exception("Timeout")
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
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

    resp = msgpack.unpackb(recvd)
    sock.close()

    if resp[0] == ResponseType.CMD_NOTFOUND.value:
        raise NotFoundError()
    elif resp[0] == ResponseType.CMD_INVALID.value:
        raise InvalidError()
    elif resp[0] == ResponseType.CMD_ERROR.value:
        raise InternalError()

    return resp