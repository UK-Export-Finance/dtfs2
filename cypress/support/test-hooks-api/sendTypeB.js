const testHookApi = () => {
  const url = `${Cypress.config('testHookApiProtocol')}${Cypress.config('testHookApiHost')}:${Cypress.config('testHookApiPort')}`;
  return url;
};

module.exports = (typeB) => {
  return cy.request({
    url: `${testHookApi()}/test-hooks/typeB`,
    method: 'POST',
    body: typeB,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });
}
