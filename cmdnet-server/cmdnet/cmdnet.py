from .internal import RequestType, ResponseType, cmdnet_send


class DeviceContext:
    """
    Represents a CommandNet device. Main object to be created for each device

    Attributes
    ----------
    host : str
        Hostname or IP address of the device
    port : str
        Port of the device
    instructions : dict[str, Instruction]
        Dictionary of instructions, indexed by name
    variables : dict[str, Variable]
        Dictionary of variables, indexed by name
    """

    def __init__(self, host: str, port: str):
        """
        Initializes the device context given host and port

        Parameters
        ----------
        host : str
            Hostname or IP address of the device
        port : str
            Port of the device
        """
        self.host = host
        self.port = port

        self.instructions: dict[str, Instruction] = {}
        self.variables: dict[str, Variable] = {}

    def connect(self):
        """
        Connect to the host and populate instructions and variables
        """

        resp = self.send([RequestType.ALL_CMDS.value])
        for cmd in resp[1]:
            self.instructions[cmd] = Instruction(self, cmd)

        resp = self.send([RequestType.ALL_VARS.value])
        for var in resp[1]:
            name = var[0]
            value = var[1]

            self.variables[name] = Variable(self, name, value)

        return self

    def send(self, req: list) -> list:
        """
        Send an arbitrary msgpack list to the device.
        Does not perform any validation on the request.
        Exception is thrown for failed responses.

        Not to be used directly, use functions on instructions and variables instead

        Parameters
        ----------
        req : list
            Request to send. Serialized to msgpack
        """
        return cmdnet_send(self.host, self.port, req)


class Instruction:
    """
    Represents a CommandNet instruction. Constructor should never be called directly,
    access through DeviceContext.instructions instead.

    Attributes
    ----------
    name : str
        Instruction name, used to call the instruction on the device
    """

    def __init__(self, context: DeviceContext, name: str):
        """
        Initializes the instruction given device context and name

        Parameters
        ----------
        deviceContext : DeviceContext
            Device context
        name : str
            Instruction name
        """
        self.context = context
        self.name = name

    def call(self) -> ResponseType:
        """
        Calls the instruction on the device

        Returns
        -------
        ResponseType
            Enum response code
        """

        resp = self.context.send([RequestType.EXEC_CMD.value, self.name])
        return resp[0]

    def __call__(self) -> ResponseType:
        """
        Calls the instruction on the device

        Returns
        -------
        ResponseType
            Enum response code
        """
        return self.call()


class Variable:
    """
    Represents a CommandNet variable. Constructor should never be called directly,
    access through DeviceContext.variables instead.

    Attributes
    ----------
    name : str
        Variable name, same as internally on the device
    old: int
        Previous value of the variable after a set. None if not set yet
    init_value: int
        Initial value of the variable, used for reset
    """

    def __init__(self, context: DeviceContext, name: str, init_value: int):
        self.context = context
        self.name = name
        self.old: int = None
        self.init_value = init_value

    def get(self) -> int:
        """
        Gets the value of the variable from the device

        Returns
        -------
        int
            Value of the variable
        """
        resp = self.context.send([RequestType.GET_VAR.value, self.name])
        return resp[1]

    def set(self, value: int):
        """
        Sets the value of the variable on the device

        Parameters
        ----------
        value : int
            Value to set the variable to
        """
        resp = self.context.send([RequestType.SET_VAR.value, self.name, value])
        self.old = resp[1]

    def reset(self):
        """
        Resets the variable to its initial value
        """
        self.set(self.init_value)

    @property
    def value(self) -> int:
        """
        Gets the value of the variable from the device, assignment sets the value

        Parameters
        ----------
        value : int
            Value to set the variable to

        Returns
        -------
        int
            Value of the variable
        """
        return self.get()

    @value.setter
    def value(self, value: int):
        self.set(value)
