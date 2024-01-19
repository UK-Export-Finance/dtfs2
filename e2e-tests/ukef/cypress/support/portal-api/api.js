const { SIGN_IN_TOKEN_LINK_TOKEN } = require("../../../../../portal-api/api-tests/fixtures/sign-in-token-constants");

const api = () => {
  const url = `${Cypress.config('dealApiProtocol')}${Cypress.config('dealApiHost')}:${Cypress.config('dealApiPort')}`;
  return url;
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
          'Content-Type': 'application/json',
          Authorization: token2fa,
        },
      })
      .then((signInLinkResponse) => {
        expect(signInLinkResponse.status).to.equal(200);
        return signInLinkResponse.body.token;
      }));
};
module.exports.logIn = ({ username, password }) => {
  cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
  return cy
    .request({
      url: `${api()}/v1/login`,
      method: 'POST',
      body: { username, password },
      headers: {
        'Content-Type': 'application/json',
      },
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
        'Content-Type': 'application/json',
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
        'Content-Type': 'application/json',
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
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });
