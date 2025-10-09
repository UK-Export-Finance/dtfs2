const { HEADERS } = require('@ukef/dtfs2-common');

const api = () => {
  const url = `${Cypress.config('tfmApiProtocol')}${Cypress.config('tfmApiHost')}:${Cypress.config('tfmApiPort')}`;
  return url;
};

module.exports.submitDeal = (dealId, dealType) =>
  cy
    .request({
      url: `${api()}/v1/deals/submit`,
      method: 'PUT',
      body: { dealId, dealType },
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

module.exports.getUser = (username) =>
  cy
    .request({
      url: `${api()}/v1/users/${username}`,
      method: 'GET',
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body.user.user;
    });
