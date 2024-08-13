const { HEADERS } = require('@ukef/dtfs2-common');
const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');

const api = () => {
  const url = `${Cypress.config('tfmApiProtocol')}${Cypress.config('tfmApiHost')}:${Cypress.config('tfmApiPort')}`;
  return url;
};

const headers = {
  'x-api-key': Cypress.config('apiKey'),
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
};

module.exports.submitDeal = (dealId, dealType, token) =>
  cy
    .request({
      url: `${api()}/v1/deals/submit`,
      method: 'PUT',
      body: { dealId, dealType, checker: BANK1_CHECKER1_WITH_MOCK_ID },
      headers: {
        ...headers,
        Authorization: token,
      },
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
      headers: {
        ...headers,
        Authorization: token,
      },
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
      headers: {
        ...headers,
        Authorization: token,
      },
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
      headers,
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);

      return resp.body.token;
    });
