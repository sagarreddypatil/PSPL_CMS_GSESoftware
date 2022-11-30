import struct
from struct_decoder import StructDecoder

base_packet_schema = """
header B
x 3 # 3 pad bytes
timestamp Q
"""


data_packet_schema = base_packet_schema + "value i\n"
multi_data_packet_schema = (
    base_packet_schema + "size I\n"
)  # rest of the buffer is the actual data in uint32_t, array of size size


imu_schema = """
# lmao it's empty
"""

imu_packet_schema = base_packet_schema + imu_schema

data_packet_decoder = StructDecoder(data_packet_schema)
multi_data_packet_decoder = StructDecoder(multi_data_packet_schema)
imu_packet_decoder = StructDecoder(imu_packet_schema)


def decode_data_packet(data: bytes) -> dict:
    sensor_packet_channel_mask = 0b00111111
    packet = data_packet_decoder.decode(data)
    packet["channel"] = data[0] & sensor_packet_channel_mask

    return packet


def decode_multi_data_packet(data: bytes) -> dict:
    sensor_packet_channel_mask = 0b00111111
    packet = multi_data_packet_decoder.decode(data)
    packet["channel"] = data[0] & sensor_packet_channel_mask

    size = packet["size"]
    base_size = multi_data_packet_decoder.size(data)

    fmt_string = "<" + "i" * size
    values = data[base_size : base_size + size * 4]
    values = struct.unpack(fmt_string, values)

    packet["values"] = values

    return packet


def decode_imu_packet(data: bytes) -> dict:
    return imu_packet_decoder.decode(data)


def decode_status_packet(data: bytes) -> dict:
    return data_packet_decoder.decode(data)


def decode_packet(data: bytes) -> dict:
    header = data[0]
    sensor_packet_marker_mask = 0b11000000

    if header & sensor_packet_marker_mask == 0:
        return decode_data_packet(data)

    elif header & sensor_packet_marker_mask == 0b01000000:
        return decode_multi_data_packet(data)

    elif header == 0x80:
        return decode_imu_packet(data)

    elif header == 0xFF:
        return decode_status_packet(data)

    else:
        raise ValueError(f"Invalid header: 0x{header:02X}")
