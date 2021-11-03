const api = () => {
  const url = `${Cypress.config('dealApiProtocol')}${Cypress.config('dealApiHost')}:${Cypress.config('dealApiPort')}`;
  return url;
};

const { QUERIES } = require('../../graphql');

module.exports.logIn = (opts) => {
  const { username, password } = opts;

  return cy.request({
    url: `${api()}/v1/login`,
    method: 'POST',
    body: { username, password },
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body.token;
  });
};

module.exports.insertDeal = (deal, token) => cy.request({
  url: `${api()}/v1/deals`,
  method: 'POST',
  body: deal,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});

module.exports.getDeal = (dealId, token) => cy.request({
  url: `${api()}/v1/deals/${dealId}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => resp.body);

module.exports.createFacilities = (dealId, facilities, user, token) => cy.request({
  url: `${api()}/v1/deals/${dealId}/multiple-facilities`,
  method: 'POST',
  body: {
    facilities,
    associatedDealId: dealId,
    user,
  },
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});

module.exports.deleteDeal = (token, deal) => cy.request({
  url: `${api()}/v1/deals/${deal._id}`,
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => expect(resp.status).to.equal(200));

module.exports.listAllDeals = (token) => {
  const body = {
    query: QUERIES.dealsQuery,
  };

  return cy.request({
    url: `${api()}/graphql`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(body),
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body.data.deals.deals;
  });
};
