import pandas as pd


class SensorRegistry(object):
    """
    Maps per-device sensor IDs to sensor objects, gets info from a pandas DataFrame
    """

    def __init__(self, df: pd.DataFrame):
        self.df = df
        self._registry = {}

        self._build_registry()

    def _build_registry(self):
        for i, row in self.df.iterrows():
            sensor_id = row["id"]
            sensor_name = row["name"]

            adc = ADC(row["bitness"], row["base_fsr"], row["gain"])
            sensor = CalibratedSensor(sensor_name, adc, row["slope"], row["offset"], row["unit"])

            self._registry[sensor_id] = sensor

    def get_sensor(self, id: int):
        return self._registry[id]


class ADC(object):
    """Abstraction for ADC"""

    def __init__(self, bitness: int, base_fsr: float, gain: int):
        fsr = base_fsr / gain
        self.lsb = fsr / (2**bitness)

    def convert(self, value):
        """Converts ADC signed integer value to voltage"""
        return value * self.lsb


class CalibratedSensor(object):
    """Abstraction for a sensor with slope and offset calibration"""

    def __init__(self, name: str, adc: ADC, slope: float, offset: float, unit: str):
        self.name = name
        self.adc = adc
        self.slope = slope
        self.offset = offset
        self.unit = unit

    def convert(self, value):
        voltage = self.adc.convert(value)
        value = voltage * self.slope + self.offset

        return (value, self.unit)
