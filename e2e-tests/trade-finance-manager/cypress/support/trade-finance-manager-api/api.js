const api = () => {
  const url = `${Cypress.config('tfmApiProtocol')}${Cypress.config('tfmApiHost')}:${Cypress.config('tfmApiPort')}`;
  return url;
};

module.exports.submitDeal = (dealId) => cy.request({
  url: `${api()}/v1/deals/submit`,
  method: 'PUT',
  body: { dealId },
  headers: {
    'Content-Type': 'application/json',
  },
}).then((resp) => {
  expect(resp.status).to.equal(200);
  console.log({ dealId, body: resp.body });
  return resp.body;
});
