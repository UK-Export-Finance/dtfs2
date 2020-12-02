const api = () => {
  const url = `${Cypress.config('dealApiProtocol')}${Cypress.config('dealApiHost')}:${Cypress.config('dealApiPort')}`;
  return url;
};

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

module.exports.deleteDeal = (token, dealId) => cy.request({
  url: `${api()}/v1/deals/${dealId}`,
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
  failOnStatusCode: false,
});
// }).then((resp) => expect(resp.status).to.equal(200));

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
