const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');

const api = () => {
  const url = `${Cypress.config('tfmApiProtocol')}${Cypress.config('tfmApiHost')}:${Cypress.config('tfmApiPort')}`;
  return url;
};

const apiKey = Cypress.config('apiKey');

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': apiKey,
};

module.exports.submitDeal = (dealId, dealType, token) => cy.request({
  url: `${api()}/v1/deals/submit`,
  method: 'PUT',
  body: { dealId, dealType, checker: BANK1_CHECKER1_WITH_MOCK_ID },
  headers: {
    ...headers,
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});

module.exports.submitDealAfterUkefIds = (dealId, dealType, checker, token) => cy.request({
  url: `${api()}/v1/deals/submitDealAfterUkefIds`,
  method: 'PUT',
  body: { dealId, dealType, checker },
  headers: {
    ...headers,
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});

module.exports.getUser = (username, token) => cy.request({
  url: `${api()}/v1/users/${username}`,
  method: 'GET',
  headers: {
    ...headers,
    Authorization: token,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body.user;
});

module.exports.login = (username, password) => cy.request({
  url: `${api()}/v1/login`,
  method: 'POST',
  body: { username, password },
  headers: {
    ...headers,
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);

  return resp.body.token;
});
