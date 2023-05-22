from .internal import RequestType, cmdnet_send

class Command:
    def __init__(self, name: str):
        self.name = name
    
    def call(self):
        resp = cmdnet_send([RequestType.EXEC_CMD.value, self.name])

    def __call__(self):
        return self.call()

class Variable:
    def __init__(self, name: str, default_value: int):
        self.name = name
        self.old: int = None
        self.default_value = default_value
    
    def get(self) -> int:
        resp = cmdnet_send([RequestType.GET_VAR.value, self.name])
        return resp[1]
    
    def set(self, value: int):
        resp = cmdnet_send([RequestType.SET_VAR.value, self.name, value])
        self.old = resp[1]

    def reset(self):
        self.set(self.default_value)

    @property
    def value(self) -> int:
        return self.get()
    
    @value.setter
    def value(self, value: int):
        self.set(value)

class CommandNet:
    def __init__(self, host: str, port: str):
        self.host = host
        self.port = port

        self.commands: Dict[str, Command] = {}
        self.variables: Dict[str, Variable] = {}

    def connect(self):
        """
        Connect to the host and populate commands and variables
        """

        resp = cmdnet_send([RequestType.ALL_CMDS.value])
        for cmd in resp[1]:
            self.commands[cmd] = Command(cmd)

        resp = cmdnet_send([RequestType.ALL_VARS.value])
        for var in resp[1]:
            name = var[0]
            value = var[1]

            self.variables[name] = newvar = Variable(name, value)