import struct
from struct_decoder import StructDecoder
from typing import NamedTuple

base_packet_schema = """
header B
x 3 # 3 pad bytes
timestamp Q
"""


class BasePacket(NamedTuple):
    header: int
    timestamp: int


data_packet_schema = base_packet_schema + "value i\n"


class BaseSensorPacket(NamedTuple):
    channel: int


class DataPacket(BasePacket):
    value: int


class SensorPacket(DataPacket, BaseSensorPacket):
    pass


multi_data_packet_schema = (
    base_packet_schema + "size I\n"
)  # rest of the buffer is the actual data in uint32_t, array of size size


class MultiDataPacket(BasePacket):
    size: int
    values: list[int]


class MultiSensorPacket(MultiDataPacket, BaseSensorPacket):
    pass


imu_schema = """
# lmao it's empty
"""


class IMUData(NamedTuple):
    pass


imu_packet_schema = base_packet_schema + imu_schema


class IMUPacket(BasePacket, IMUData):
    pass


data_packet_decoder = StructDecoder(data_packet_schema)
multi_data_packet_decoder = StructDecoder(multi_data_packet_schema)
imu_packet_decoder = StructDecoder(imu_packet_schema)


def decode_sensor_packet(data: bytes) -> SensorPacket:
    sensor_packet_channel_mask = 0b00111111
    packet = data_packet_decoder.decode(data)
    packet["channel"] = data[0] & sensor_packet_channel_mask

    packet_obj = SensorPacket(**packet)

    return packet_obj


def decode_multi_sensor_packet(data: bytes) -> MultiSensorPacket:
    sensor_packet_channel_mask = 0b00111111
    packet = multi_data_packet_decoder.decode(data)
    packet["channel"] = data[0] & sensor_packet_channel_mask

    size = packet["size"]
    base_size = multi_data_packet_decoder.size(data)

    fmt_string = "<" + "i" * size
    values = data[base_size : base_size + size * 4]
    values = struct.unpack(fmt_string, values)

    packet["values"] = values

    packet_obj = MultiSensorPacket(**packet)

    return packet_obj


def decode_imu_packet(data: bytes) -> IMUPacket:
    packet = imu_packet_decoder.decode(data)
    packet_obj = IMUPacket(**packet)

    return packet_obj


def decode_status_packet(data: bytes) -> DataPacket:
    return data_packet_decoder.decode(data)


def decode_packet(data: bytes) -> dict:
    header = data[0]
    sensor_packet_marker_mask = 0b11000000

    if header & sensor_packet_marker_mask == 0:
        return decode_sensor_packet(data)

    elif header & sensor_packet_marker_mask == 0b01000000:
        return decode_multi_sensor_packet(data)

    elif header == 0x80:
        return decode_imu_packet(data)

    elif header == 0xFF:
        return decode_status_packet(data)

    else:
        raise ValueError(f"Invalid header: 0x{header:02X}")
