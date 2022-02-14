const api = () => {
  const url = `${Cypress.config('apiProtocol')}${Cypress.config('apiHost')}:${Cypress.config('apiPort')}`;
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
    url: `${api()}/v1/deals`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(body),
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body.deals;
  });
};

module.exports.listAllUsers = (token) => cy.request({
  url: `${api()}/v1/users`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body.users;
});

module.exports.deleteUser = (token, user) => cy.request({
  url: `${api()}/v1/users/${user._id}`,
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => expect(resp.status).to.equal(200));

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

module.exports.updateDeal = (dealId, update, token) => cy.request({
  url: `${api()}/v1/deals/${dealId}`,
  method: 'PUT',
  body: update,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});

module.exports.updateBond = (dealId, bondId, update, token) => cy.request({
  url: `${api()}/v1/deals/${dealId}/bond/${bondId}`,
  method: 'PUT',
  body: update,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
  failOnStatusCode: false, // need to allow this for when we invalidate a bond and test user flow
}).then((resp) => resp.body);

module.exports.updateLoan = (dealId, loanId, update, token) => cy.request({
  url: `${api()}/v1/deals/${dealId}/loan/${loanId}`,
  method: 'PUT',
  body: update,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
  failOnStatusCode: false, // need to allow this for when we invalidate a bond and test user flow
}).then((resp) => resp.body);

module.exports.downloadFile = (token, deal) => cy.request({
  url: `${api()}/v1/deals/${deal._id}/integration/type-a`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});

module.exports.createFacilities = (dealId, facilities, user, token) => cy.request({
  url: `${api()}/v1/deals/${dealId}/multiple-facilities`,
  method: 'POST',
  body: {
    facilities,
    dealId,
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

module.exports.listGefApplications = (token) => cy.request({
  url: `${api()}/v1/gef/application/`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body.items;
});

module.exports.deleteGefApplication = (token, dealId) => cy.request({
  url: `${api()}/v1/gef/application/${dealId}`,
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => expect(resp.status).to.equal(200));

module.exports.insertGefApplication = (deal, token) => cy.request({
  url: `${api()}/v1/gef/application`,
  method: 'POST',
  body: deal,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(201);
  return resp.body;
});

exports.updateGefApplication = (dealId, payload, token) => cy.request({
  url: `${api()}/v1/gef/application/${dealId}`,
  method: 'PUT',
  body: payload,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});

module.exports.setGefApplicationStatus = (dealId, token, status) => cy.request({
  url: `${api()}/v1/gef/application/status/${dealId}`,
  method: 'PUT',
  body: { status },
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

module.exports.listGefFacilities = (token, dealId) => cy.request({
  url: `${api()}/v1/gef/facilities/?dealId=${dealId}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body.items;
});

module.exports.deleteGefFacility = (token, facility) => cy.request({
  url: `${api()}/v1/gef/facilities/${facility.details._id}`,
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => expect(resp.status).to.equal(200));

module.exports.insertGefFacility = (deal, token) => cy.request({
  url: `${api()}/v1/gef/facilities`,
  method: 'POST',
  body: deal,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(201);
  return resp.body;
});

module.exports.updateGefFacility = (facilityId, payload, token) => cy.request({
  url: `${api()}/v1/gef/facilities/${facilityId}`,
  method: 'PUT',
  body: payload,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});
