import time
from lark import Lark, Transformer, v_args, UnexpectedInput
from enum import Enum
import msgpack
import socket
import readline


class FirmwareError(Exception):
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


# Shell grammar
grammar = """?start: cmd
?cmd: "exec" WORD -> exec
    | "all" "cmds" -> all_cmds
    | "set" WORD eval -> set_var
    | "get" WORD -> get_var
    | "all" "vars" -> all_vars
    | "exit" -> exit
eval: NUMBER
    | "`" /[^`]+/ "`" -> eval

%import common.CNAME -> WORD
%import common.NUMBER
%import common.WS_INLINE
%ignore WS_INLINE
"""

host = "192.168.2.50"
port = 8080
timeout = 1


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
        raise FirmwareError("Resource not found")
    elif resp[0] == ResponseType.CMD_INVALID.value:
        raise FirmwareError("Invalid command")
    elif resp[0] == ResponseType.CMD_ERROR.value:
        raise FirmwareError("Command error")

    return resp


@v_args(inline=True)
class Shell(Transformer):
    def exec(self, cmd):
        req = [RequestType.EXEC_CMD.value, cmd.value]
        resp = cmdnet_send(req)

        return "Success"

    def all_cmds(self):
        req = [RequestType.ALL_CMDS.value]
        resp = cmdnet_send(req)

        ret = "\n".join(resp[1])
        return ret

    def set_var(self, var, val):
        req = [RequestType.SET_VAR.value, var.value, int(val)]
        resp = cmdnet_send(req)

        return f"Old value: {resp[1]}"

    def get_var(self, var):
        req = [RequestType.GET_VAR.value, var.value]
        resp = cmdnet_send(req)

        return f"Value: {resp[1]}"

    def all_vars(self):
        req = [RequestType.ALL_VARS.value]
        resp = cmdnet_send(req)

        ret = "\n".join([f"{i[0]}:\t\t{i[1]}" for i in resp[1]])
        return ret

    def exit(self):
        return None

    def eval(self, expr):
        try:
            return eval(expr)
        except:
            raise UnexpectedInput("Invalid expression")


readline.parse_and_bind("tab: complete")

parser = Lark(grammar, parser="lalr", transformer=Shell())
while True:
    try:
        cmd = input("cmd>")
        resp = parser.parse(cmd)
        if resp is None:
            break

        print(resp)

    except Exception as e:
        print(e)
