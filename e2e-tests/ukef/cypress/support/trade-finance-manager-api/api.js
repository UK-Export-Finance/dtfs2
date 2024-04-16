const api = () => {
  const url = `${Cypress.config('tfmApiProtocol')}${Cypress.config('tfmApiHost')}:${Cypress.config('tfmApiPort')}`;
  return url;
};

const apiKey = Cypress.config('apiKey');

const genericHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': apiKey,
};

const headers = (token) => ({
  ...genericHeaders,
  Authorization: token,
});

module.exports.submitDeal = (dealId, dealType, token) => cy.request({
  url: `${api()}/v1/deals/submit`,
  method: 'PUT',
  body: { dealId, dealType },
  headers: headers(token),
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});

// TODO: DTFS2-7112 this endpoint is obsolete and should be removed
module.exports.submitDealAfterUkefIds = (dealId, dealType, checker, token) => cy.request({
  url: `${api()}/v1/deals/submitDealAfterUkefIds`,
  method: 'PUT',
  body: { dealId, dealType, checker },
  headers: headers(token),
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});

module.exports.getUser = (username, token) => cy.request({
  url: `${api()}/v1/users/${username}`,
  method: 'GET',
  headers: headers(token),
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body.user;
});
