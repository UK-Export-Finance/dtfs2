const http = require('http')
const axios =require('axios');
const api = require('./api');

module.exports = (opts, callback) => {
  const { username, password } = opts;

  cy.request({
    url: `http://${api().host}:${api().port}/v1/login`,
    method: 'POST',
    body: {username, password},
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    callback(resp.body.token);
  });
}
