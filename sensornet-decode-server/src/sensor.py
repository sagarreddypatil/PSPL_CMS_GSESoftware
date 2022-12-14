from influxdb_client import WriteApi
from typing import NamedTuple
import pandas as pd


class SensorPoint(NamedTuple):
    id: int
    name: str
    time: int
    value: int
    unit: str


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

    def __init__(self, id: int, name: str, adc: ADC, slope: float, offset: float, unit: str):
        self.id = id
        self.name = name
        self.adc = adc
        self.slope = slope
        self.offset = offset
        self.unit = unit

    def convert(self, time, value):
        voltage = self.adc.convert(value)
        value = voltage * self.slope + self.offset

        return SensorPoint(self.id, self.name, time, value, self.unit)


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
            id = row["id"]
            name = row["name"]

            adc = ADC(row["bitness"], row["base_fsr"], row["gain"])
            sensor = CalibratedSensor(id, name, adc, row["slope"], row["offset"], row["unit"])

            self._registry[id] = sensor

    def get_sensor(self, id: int):
        return self._registry[id]


class SensorInfluxWriter(object):
    def __init__(self, write_api: WriteApi, bucket: str, measurement: str):
        self.write_api = write_api
        self.bucket = bucket
        self.measurement = measurement

    def write(self, point: SensorPoint):
        self.write_api.write(
            self.bucket,
            record=point,
            record_tag_keys=["id", "name"],
            record_field_keys=["value", "unit"],
            record_time_key="time",
        )
