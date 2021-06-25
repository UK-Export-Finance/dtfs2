const api = () => {
  const url = `${Cypress.config('referenceDataApiProtocol')}${Cypress.config('referenceDataApiHost')}:${Cypress.config('referenceDataApiPort')}`;
  return url;
};

module.exports.getIdFromNumberGenerator = (entityType) => {
  console.log('getIdFromNumberGenerator::');
  return cy.request({
    url: `${api()}/number-generator/${entityType}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });
};
