from flask import Flask
from cryptography.hazmat.primitives.asymmetric import rsa

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

app = Flask(__name__)

@app.route("/hello")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/config")
def send_config(name, value):
    pass
    return("<p>send config/calibrations<p>")

@app.route("/confirmation")
def send_confirmation(name, value):
    pass
    return("<p>send launch confirmations<p>")

@app.route("/hold")
def hold_countdown():
    pass
    return("<p>hold the launch countdown<p>")

@app.route("/continue")
def continue_countdown():
    pass
    return("<p>stop holding and continue the launch countdown<p>")

print(private_key)
