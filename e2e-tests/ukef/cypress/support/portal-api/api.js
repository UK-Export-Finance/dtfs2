const { HEADERS } = require('@ukef/dtfs2-common');
const { SIGN_IN_TOKEN_LINK_TOKEN } = require('../../../../../portal-api/api-tests/fixtures/sign-in-token-constants');

const api = () => {
  const url = `${Cypress.config('dealApiProtocol')}${Cypress.config('dealApiHost')}:${Cypress.config('dealApiPort')}`;
  return url;
};

const headers = {
  'x-api-key': Cypress.config('portalApiKey'),
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
};

const completeLoginWithSignInLink = ({ token2fa, username }) => {
  const signInToken = SIGN_IN_TOKEN_LINK_TOKEN.EXAMPLE_ONE;
  cy.overridePortalUserSignInTokenWithValidTokenByUsername({ username, newSignInToken: signInToken });
  cy.getUserByUsername(username).then(({ _id: userId }) =>
    cy
      .request({
        url: `${api()}/v1/users/${userId}/sign-in-link/${signInToken}/login`,
        method: 'POST',
        headers: {
          ...headers,
          Authorization: token2fa,
        },
      })
      .then((signInLinkResponse) => {
        expect(signInLinkResponse.status).to.equal(200);
        return signInLinkResponse.body.token;
      }),
  );
};
module.exports.logIn = ({ username, password }) => {
  cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
  return cy
    .request({
      url: `${api()}/v1/login`,
      method: 'POST',
      body: { username, password },
      headers,
    })
    .then((loginResponse) => {
      expect(loginResponse.status).to.equal(200);

      return completeLoginWithSignInLink({
        token2fa: loginResponse.body.token,
        username,
      });
    });
};

module.exports.insertDeal = (deal, token) =>
  cy
    .request({
      url: `${api()}/v1/deals`,
      method: 'POST',
      body: deal,
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        Authorization: token,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

module.exports.insertGefDeal = (deal, userDetails, token) =>
  cy
    .request({
      url: `${api()}/v1/gef/application`,
      method: 'POST',
      body: deal,
      user: userDetails,
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        Authorization: token,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(201);
      return resp.body;
    });

module.exports.updateGefDeal = (dealId, update, token) =>
  cy
    .request({
      url: `${api()}/v1/gef/application/${dealId}`,
      method: 'PUT',
      body: update,
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        Authorization: token,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

module.exports.getDeal = (dealId, token) =>
  cy
    .request({
      url: `${api()}/v1/deals/${dealId}`,
      method: 'GET',
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        Authorization: token,
      },
    })
    .then((resp) => resp.body);

module.exports.getGefDeal = (dealId, token) =>
  cy
    .request({
      url: `${api()}/v1/gef/application/${dealId}`,
      method: 'GET',
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        Authorization: token,
      },
    })
    .then((resp) => resp.body);

module.exports.createFacilities = (dealId, facilities, user, token) =>
  cy
    .request({
      url: `${api()}/v1/deals/${dealId}/multiple-facilities`,
      method: 'POST',
      body: {
        facilities,
        dealId,
        user,
      },
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        Authorization: token,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

module.exports.createGefFacilities = (dealId, facility, type, user, token) =>
  cy
    .request({
      url: `${api()}/v1/gef/facilities`,
      method: 'POST',
      body: {
        facility,
        dealId,
        user,
        type,
      },
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        Authorization: token,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(201);
      return resp.body;
    });

module.exports.updateGefFacilities = (facilityId, facility, token) =>
  cy
    .request({
      url: `${api()}/v1/gef/facilities/${facilityId}`,
      method: 'PUT',
      body: facility,
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        Authorization: token,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });
