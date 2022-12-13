class DataPoint(object):
    def __init__(self, name, timestamp):
        self.timestamp = timestamp

    def __dict__(self):
        return {"timestamp": self.timestamp}
