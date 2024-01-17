const api = () => {
  const url = `${Cypress.config('dealApiProtocol')}${Cypress.config('dealApiHost')}:${Cypress.config('dealApiPort')}`;
  return url;
};

const apiKey = Cypress.config('apiKey');

const completeLoginWithSignInLink = ({ username }) => {
  const signInToken = '6569ca7a6fd828f925e07c6e';
  cy.overridePortalUserSignInTokenByUsername({ username, newSignInToken: signInToken });
  cy.getUserByUsername(username).then(({ _id: userId }) =>
    cy
      .request({
        url: `${api()}/v1/users/${userId}/sign-in-link/${signInToken}/login`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
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
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((loginResponse) => {
      expect(loginResponse.status).to.equal(200);

      return completeLoginWithSignInLink({
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
