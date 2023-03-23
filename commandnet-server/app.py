from flask import Flask, jsonify
import os
import time
import request, socket

HOST = '127.0.0.1'

app = Flask(__name__)

def sendMsg(ciphertext, PORT):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
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
def GetMsgSendMsg(uuid):
    content = request.get_json()
    print(f"encrypted data to send: {content['ciphertext']}")
    
    sendMsg(content['ciphertext'], content['port'])
    return f"message sent: {uuid}"


if __name__ == "__main__":
    #context = ('local.crt', 'local.key')
    app.run(host=HOST, port=5000, debug=True, ssl_context="adhoc")