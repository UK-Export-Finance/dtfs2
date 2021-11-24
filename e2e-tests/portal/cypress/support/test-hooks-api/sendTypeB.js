const testHookApi = () => {
  const url = `${Cypress.config('testHookApiProtocol')}${Cypress.config('testHookApiHost')}:${Cypress.config('testHookApiPort')}`;
  return url;
};

module.exports = (typeB) => cy.request({
  url: `${testHookApi()}/fileshare/typeB`,
  method: 'POST',
  body: typeB,
  headers: {
    'Content-Type': 'application/json',
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  return resp.body;
});
