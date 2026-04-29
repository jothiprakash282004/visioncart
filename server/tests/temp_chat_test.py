import urllib.request
import json

url = 'http://localhost:5000/chat'
data = json.dumps({'message': 'show me lipstick'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as res:
    print(res.status)
    print(res.read().decode('utf-8'))
