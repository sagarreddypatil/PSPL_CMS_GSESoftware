class DataPoint(object):
    """
    Base class for all data points
    """

    def __init__(self, timestamp: int):
        self.timestamp = timestamp

    def __dict__(self):
        return {"timestamp": self.timestamp}


class SensorDataPoint(DataPoint):
    def __init__(self, id: int, timestamp: int, value: int):
        super().__init__(timestamp)
        self.id = id
        self.value = value

    def __dict__(self):
        return {"id": self.id, "timestamp": self.timestamp, "value": self.value}
