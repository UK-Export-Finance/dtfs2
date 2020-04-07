const http = require('http')
const axios =require('axios');
const api = require('./api');

module.exports = (opts, callback) => {
  const { username, password } = opts;

  const data = JSON.stringify({username,password});

  const options = {
    hostname: api().host,
    port: api().port,
    path: '/v1/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, res => {
    console.log(`loginViaAPI :: ${username} -> ${res.statusCode}`)

    res.on('data', data => {
      const json = JSON.parse(data);
      callback(null, json.token);
    })
  });

  req.on('error', error => {
    callback(error);
  });

  req.write(data);
  req.end();
}
