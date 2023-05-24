from flask import Flask, make_response
from ..cmdnet import *

app = Flask(__name__)
devices = {
    "emu": DeviceContext("localhost", 5000),
}


@app.route("/")
def root():
    return "Why are you here?"


@app.route("/devices")
def get_devices():
    return devices.keys()


@app.route("/devices/<device>")
def get_device(device):
    try:
        device_obj = devices[device]
    except KeyError:
        return "Device not found", 404

    return {
        "instructions": device_obj.instructions.keys(),
        "variables": device_obj.variables.keys(),
    }


@app.route("/devices/<device>/instructions")
def get_instructions(device):
    try:
        return devices[device].instructions.keys()
    except KeyError:
        return "Device not found", 404


@app.route("/devices/<device>/instructions/<instruction>/call")
def call_instruction(device, instruction):
    try:
        device_obj = devices[device]
    except KeyError:
        return "Device not found", 404

    try:
        return str(device_obj.instructions[instruction].call())
    except KeyError:
        return "Instruction not found", 404


@app.route("/devices/<device>/variables")
def get_variables(device):
    try:
        device_obj = devices[device]
    except KeyError:
        return "Device not found", 404

    return device_obj.variables.keys()


@app.route("/devices/<device>/variables/<variable>")
def get_variable(device, variable):
    try:
        device_obj = devices[device]
    except KeyError:
        return "Device not found", 404

    try:
        return {"value": device_obj.variables[variable].get()}
    except KeyError:
        return "Variable not found", 404


@app.route("/devices/<device>/variables/<variable>/set/<value>")
def set_variable(device, variable, value):
    try:
        device_obj = devices[device]
    except KeyError:
        return "Device not found", 404

    try:
        variable_obj = device_obj.variables[variable]
    except KeyError:
        return "Variable not found", 404

    variable_obj.set(value)
    return {"old": variable_obj.old, "value": variable_obj.get()}
