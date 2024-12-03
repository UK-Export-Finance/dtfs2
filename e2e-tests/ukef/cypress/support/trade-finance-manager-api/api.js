const { HEADERS } = require('@ukef/dtfs2-common');

const api = () => {
  const url = `${Cypress.config('tfmApiProtocol')}${Cypress.config('tfmApiHost')}:${Cypress.config('tfmApiPort')}`;
  return url;
};

const genericHeaders = {
  'x-api-key': Cypress.config('tfmApiKey'),
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
};

const headers = (token) => ({
  ...genericHeaders,
  Authorization: token,
});

module.exports.submitDeal = (dealId, dealType, token) =>
  cy
    .request({
      url: `${api()}/v1/deals/submit`,
      method: 'PUT',
      body: { dealId, dealType },
      headers: headers(token),
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

// TODO: DTFS2-7112 this endpoint is obsolete and should be removed
module.exports.submitDealAfterUkefIds = (dealId, dealType, checker, token) =>
  cy
    .request({
      url: `${api()}/v1/deals/submitDealAfterUkefIds`,
      method: 'PUT',
      body: { dealId, dealType, checker },
      headers: headers(token),
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

module.exports.getUser = (username, token) =>
  cy
    .request({
      url: `${api()}/v1/users/${username}`,
      method: 'GET',
      headers: headers(token),
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body.user;
    });

module.exports.login = (username, password) =>
  cy
    .request({
      url: `${api()}/v1/login`,
      method: 'POST',
      body: { username, password },
      headers: genericHeaders,
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);

      return resp.body.token;
    });
