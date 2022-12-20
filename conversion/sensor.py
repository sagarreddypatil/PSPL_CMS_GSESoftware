from influxdb_client import WriteApi, WritePrecision
from typing import NamedTuple
import pandas as pd


class SensorPoint(NamedTuple):
    name: str
    time: int
    raw_value: int
    value: float


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

    def __init__(self, name: str, adc: ADC, slope: float, offset: float):
        self.name = name
        self.adc = adc
        self.slope = slope
        self.offset = offset

    def convert(self, time, raw_value):
        voltage = self.adc.convert(raw_value)
        value = voltage * self.slope + self.offset

        return SensorPoint(self.name, time, value, value)


class SensorRegistry(object):
    """
    Maps per-device sensor IDs to sensor objects, gets info from a pandas DataFrame
    """

    def __init__(self, df: pd.DataFrame):
        self.df = df
        self._registry = {}
        self._units = {}

        self._build_registry()

    def _build_registry(self):
        for i, row in self.df.iterrows():
            device = row["device"]
            id = row["id"]
            name = row["name"]

            adc = ADC(row["bitness"], row["base_fsr"], row["gain"])
            sensor = CalibratedSensor(name, adc, row["slope"], row["offset"])

            self._registry[(device, id)] = sensor
            self._units[name] = row["unit"]

    def get_sensor(self, device: str, id: int):
        return self._registry[(device, id)]

    def get_unit(self, name: str):
        return self._units[name]


class SensorInfluxWriter(object):
    def __init__(self, write_api: WriteApi, bucket: str):
        self.write_api = write_api
        self.bucket = bucket

    def write(self, point: SensorPoint):
        self.write_api.write(
            bucket=self.bucket,
            write_precision=WritePrecision.US,  # type: ignore
            record=point,
            record_measurement=point.name,
            record_tag_keys=["id", "name"],
            record_field_keys=["raw_value", "value"],
            record_time_key="time",
        )
