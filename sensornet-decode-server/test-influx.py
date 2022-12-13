from dotenv import load_dotenv

load_dotenv()

import influxdb_client, os, time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import WriteOptions

token = os.environ.get("INFLUXDB_TOKEN")
token = token if token else "bruh"  # to shut up the linter

org = "cratermakerspecial"
url = "http://localhost:8086"

client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)

bucket = "sensornet"

write_api = client.write_api(
    write_options=WriteOptions(
        batch_size=500, flush_interval=500, jitter_interval=100, retry_interval=100
    )
)


last = time.time()
start = time.time()

count = 0

while True:
    value = time.time() - start

    point = Point("floatmeasure").tag("floatytag", "floatytagval").field("lmao", value)
    write_api.write(bucket=bucket, org="cratermakerspecial", record=point)

    count += 1

    if time.time() - last > 1:
        print("Wrote point: " + str(point))
        last = time.time()
        break

print(count)
