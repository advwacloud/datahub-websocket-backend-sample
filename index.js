'use strict';

const https = require('https');
const WebSocket = require('ws');
const SSO_URL = 'portal-sso-ensaas.sa.wise-paas.com';
const DataHub_URL = 'portal-datahub-datahub-eks008.sa.wise-paas.com:443';

// Request Format
const RequestMessage = JSON.stringify({
  'topic': '/realdata/convert/req',
  'message': [{
    'nodeId': '909633ff-5c60-4f24-841d-34dfa4ea1693',
    'deviceId': 'Device1',
    'tagName': 'ATag1'
  }, {
    'nodeId': '909633ff-5c60-4f24-841d-34dfa4ea1693',
    'deviceId': 'Device1',
    'tagName': 'ATag2'
  }]
});

WebSocketRequest();

function WebSocketRequest () {
  getToken() // Get SSO token
    .then(function (Token) {
      // Create a WebSocket client
      const ws = new WebSocket('wss://' + DataHub_URL, null, {headers: {Authorization: 'Bearer ' + Token.accessToken}});

      // When websocket connect success, send request message
      ws.onopen = function () {
        console.log('websocket connect success!');
        console.log('send request message: ' + RequestMessage);
        ws.send(RequestMessage);
        console.log('sending...');
      };

      // Print the responsed message
      ws.onmessage = function (event) {
        console.log('get reponse message: ' + event.data);
      };

      // When connection error, reconnect again
      ws.onerror = function () {
        console.log('WebSocket connection error!');
        WebSocketRequest();
        console.log('connecting.....');
      };

      // connection close
      ws.onclose = function () {
        console.log('connection close');
      };
    }, function (err) {
      console.log('Get token error !' + err);
    });
}

function getToken () {
  // SSO username and password
  const data = JSON.stringify({
    username: 'username',
    password: 'password'
  });

  const options = {
    hostname: SSO_URL,
    port: 443,
    path: '/v4.0/auth/native',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise(function (resolve, reject) {
    const req = https.request(options, res => {
      res.on('data', d => { resolve(JSON.parse(d)); }); // response token info
    });

    req.on('error', error => { reject(error); }); // response error
    req.write(data);
    req.end();
  });
}
