import struct
from conversion.sensor import SensorRegistry

"""
Basic Data Struct
typedef struct {
  u32 header;
  i32 data;
  u64 time;
  u64 counter;
} data_packet_t;
"""
basic_data_struct = struct.Struct("<IiQQ")

header_struct = struct.Struct("<I")
header_prefix_mask = 0xFFFF0000

sensor_id_mask = 0xFFFF


class PacketDecoder(object):
    def __init__(self, sensor_registry: SensorRegistry):
        self.sensor_registry = sensor_registry
        self.header_prefix_matcher = {
            0xDA7A0000: self.decode_sensor_data,
            0xFA670000: None,  # TODO: high rate sensor data
            0xCAFE0000: None,  # TODO:
            0x11FE0000: None,
        }

    def decode_sensor_data(self, data: bytes):
        (header, data, time, counter) = basic_data_struct.unpack_from(data, offset=0)
        sensor_id = header & sensor_id_mask

        sensor = self.sensor_registry.get_sensor(sensor_id)
        if sensor is None:
            raise ValueError("Unknown sensor ID: " + hex(sensor_id))

        return sensor.convert(time, data)

    def decode(self, data: bytes):
        (header,) = header_struct.unpack_from(data, offset=0)

        prefix = header & header_prefix_mask
        if prefix not in self.header_prefix_matcher:
            raise ValueError("Unknown header prefix: " + hex(prefix))

        decoder = self.header_prefix_matcher[prefix]
        return decoder(data)
