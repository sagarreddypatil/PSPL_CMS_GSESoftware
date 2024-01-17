from flask import Flask, request
from flask_cors import CORS

from internal import cmdnet_send, Device, CmdNetException

app = Flask(__name__)
CORS(app)

devices = {
    "emu": Device("192.168.1.50", 8106),
}


@app.route("/")
def root():
    return "Why are you here?"


@app.route("/devices")
def get_devices():
    return list(devices.keys())


@app.route("/devices/<device>/<cmd>", methods=["POST"])
def call_command(device, cmd):
    try:
        device_obj = devices[device]
    except KeyError:
        return "Device not found", 404

    # get params from body which is a json list
    # actual command = [cmd, *params]

    params = request.get_json()
    if not params:
        params = []

    # check if params isn't list
    if not isinstance(params, list):
        return "Invalid params", 400

    cmd = [cmd, *params]

    try:
        return str(cmdnet_send(device_obj, cmd))
    except CmdNetException as e:
        return str(e), 500
