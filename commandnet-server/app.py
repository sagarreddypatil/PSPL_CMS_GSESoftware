from flask import Flask, jsonify
import os
import time
import request, socket

# hardcoded locations - please change before launch
EMU_IP = '127.0.0.1'
UFC_IP = '127.0.0.1'
LFC_IP = '127.0.0.1'
PORT = 1234 # commandnet port

app = Flask(__name__)

def sendMsg(ciphertext, device):
    if device == "EMU":
        host = EMU_IP
    if device == "UFC":
        host = UFC_IP
    if device == "LFC":
        host = LFC_IP

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, PORT))
        s.listen(1)
        print('waiting for connection')
        conn, addr = s.accept()
        print(f"connection established at {addr}")
        totalsent = 0
        while totalsent < len(ciphertext):
            sent = conn.send(ciphertext[totalsent:])
            if sent == 0:
                print("socket connection broken")
                return
            totalsent = totalsent + sent
    return

@app.route("/hello")
def hello_world():
    return "Hello, World!"
@app.route('/hello/<name>')
def hello(name=None):
    return f"<p>Hello, {name}!</p>"

@app.route("/acceptmessage/<uuid>", methods = ["GET","POST"])
def GetMsgSendMsg():
    content = request.get_json()
    print(f"encrypted data to send: {content['ciphertext']}")
    
    sendMsg(content['ciphertext'], content["device"])
    return f"message sent!"


if __name__ == "__main__":
    #context = ('local.crt', 'local.key')
    app.run(host=HOST, port=5000, debug=True, ssl_context="adhoc")