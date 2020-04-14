const http = require('http')
const axios =require('axios');
const api = require('./api');

const loginViaAPI = require('./loginViaAPI');

const insertDeal = (deal, token, callback) => {
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

const insertDeals = (token, deals, callback) => {
  const persisted = [];
  for (const dealToInsert of deals) {

    insertDeal(dealToInsert, token, (persistedDeal) => {
      persisted.push(persistedDeal);

      if (persisted.length  === deals.length) {
        callback(persisted);
      }

    })
  };
}

module.exports =  (deals, opts) => {
  console.log(`createManyDeals::`);

  loginViaAPI(opts, (token) => {
    insertDeals(token, deals, (insertedDeals) => {
      cy.cacheDeals(insertedDeals);
    })
  });
}
