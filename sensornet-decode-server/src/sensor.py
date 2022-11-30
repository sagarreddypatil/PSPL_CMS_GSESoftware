class ADC(object):
    """Abstraction for ADC"""

    def __init__(self, bitness, base_fsr, gain):
        fsr = base_fsr / gain
        self.lsb = fsr / (2**bitness)

    def convert(self, value):
        """Converts ADC signed integer value to voltage"""
        return value * self.lsb


class CalibratedSensor(object):
    """Abstraction for a sensor with slope and offset calibration"""

    def __init__(self, adc, slope, offset, unit):
        self.adc = adc
        self.slope = slope
        self.offset = offset
        self.unit = unit

    def convert(self, value):
        voltage = self.adc.convert(value)
        value = voltage * self.slope + self.offset

        return (value, self.unit)
