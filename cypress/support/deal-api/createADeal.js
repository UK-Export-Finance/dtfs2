const http = require('http')
const axios =require('axios');
const api = require('./api');

const loginViaAPI = require('./loginViaAPI');

const insertDeal = (token, deal, callback) => {

  cy.request({
    url: `http://${api().host}:${api().port}/v1/deals`,
    method: 'POST',
    body: deal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    callback(resp.body);
  });
}

module.exports = (deal, opts) => {
  loginViaAPI(opts, (token) => {
    insertDeal(token, deal, (inserted) => {
      cy.cacheDeals([inserted]);
    })
  });
}
