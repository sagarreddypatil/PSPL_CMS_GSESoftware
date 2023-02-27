from flask import Flask
import os
from cryptography.hazmat.primitives.ciphers.aead import AESSIV

# transfer str into bytes (so brandon does not have to search it up again): str.encode("UTF-8")
def createNonce():
    return(os.urandom(16))

def createAESAuth():
    return AESSIV.generate_key(bit_length=512)  

def encryptdata(pwd, nonce, key, data):
    aad = [pwd.encode("UTF-8"), nonce]
    aessiv = AESSIV(key)
    ct = aessiv.encrypt(data.encode("UTF-8"), aad)
    return(ct)

#idk why i wrote a decryption but here it is !!!!!

def decryptdata(pwd, nonce, key, ct):
    aad = [pwd.encode("UTF-8"), nonce]
    aessiv = AESSIV(key)
    return(aessiv.decrypt(ct, aad).decode("UTF-8"))

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

print(2)
