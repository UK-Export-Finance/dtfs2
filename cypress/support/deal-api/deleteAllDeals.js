const http = require('http')
const axios =require('axios');
const api = require('./api');

const loginViaAPI = require('./loginViaAPI');



const deleteDeal = (token, deal, callback) => {
    cy.request({
      url: `http://${api().host}:${api().port}/v1/deals/${deal._id}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    }).then((resp) => {
      expect(resp.status).to.equal(200);
      callback && callback();
    });
};

const deleteAllDeals = (token, deals, callback) => {
  const deleted = [];
  for (const dealToDelete of deals) {
    deleteDeal(token, dealToDelete, () => {
      deleted.push(dealToDelete);
      console.log(`deleted ${deleted.length} of ${deals.length}`)

      if (deleted.length  === deals.length) {
        callback();
      }

    })
  };
}

const listAllDeals = (token, callback) => {
  cy.request({
    url: `http://${api().host}:${api().port}/v1/deals`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    callback(resp.body.deals);
  });
};

module.exports =  (opts) => {
  console.log(`deleteAllDeals::`);

  loginViaAPI(opts, (token) => {
    listAllDeals(token, (deals) => {
      deleteAllDeals(token, deals, () => {
        cy.clearDeals(deals);
        console.log(`finished deleting`);
      });
    })
  });
}
