const portalApi = 'http://localhost:5001/v1';
const centralApiUrl = () => {
  const url = `${Cypress.config('baseUrl')}:${Cypress.config('centralApiPort')}`;
  return url;
};

const apiKey = Cypress.config('apiKey');

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': apiKey,
};

const tfmApiUrl = () => {
  const url = `${Cypress.config('tfmApiProtocol')}${Cypress.config('tfmApiHost')}:${Cypress.config('tfmApiPort')}`;
  return url;
};

const login = ({ username, password }) => {
  cy.resetUserStatusAndNumberOfSignInLinks(username);

  cy.request({
    url: `${portalApi}/login`,
    method: 'POST',
    body: { username, password },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const signInToken = '6569ca7a6fd828f925e07c6e';
  cy.overrideUserSignInTokenByUsername({ username, newSignInToken: signInToken });

  return cy.getUserByUsername(username).then(({ _id: userId }) =>
    cy
      .request({
        url: `${portalApi}/users/${userId}/sign-in-link/${signInToken}/login`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      })
      .then((signInLinkResponse) => {
        expect(signInLinkResponse.status).to.equal(200);
        return signInLinkResponse.body.token;
      }));
};

const fetchAllApplications = (token) =>
  cy
    .request({
      url: `${portalApi}/gef/application`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    .then((res) => res);

const fetchApplicationById = (dealId, token) =>
  cy
    .request({
      url: `${portalApi}/gef/application/${dealId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    .then((res) => res);

const fetchAllFacilities = (dealId, token) =>
  cy
    .request({
      url: `${portalApi}/gef/facilities`,
      qs: {
        dealId,
      },
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    .then((res) => res);

const createApplication = (user, token) =>
  cy
    .request({
      url: `${portalApi}/gef/application`,
      method: 'POST',
      body: user,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    .then((res) => res);

const updateApplication = (dealId, token, update) =>
  cy
    .request({
      url: `${portalApi}/gef/application/${dealId}`,
      method: 'PUT',
      body: update,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    .then((res) => res);

const createFacility = (dealId, type, token) =>
  cy
    .request({
      url: `${portalApi}/gef/facilities`,
      method: 'POST',
      body: { dealId, type },
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    .then((res) => res);

const updateFacility = (facilityId, token, update) =>
  cy
    .request({
      url: `${portalApi}/gef/facilities/${facilityId}`,
      method: 'PUT',
      body: update,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    .then((res) => res);

const setApplicationStatus = (dealId, token, status) =>
  cy
    .request({
      url: `${portalApi}/gef/application/status/${dealId}`,
      method: 'PUT',
      body: { status },
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    .then((res) => res);

const addCommentObjToDeal = (dealId, commentType, comment) =>
  cy
    .request({
      url: `${centralApiUrl()}/v1/portal/gef/deals/${dealId}/comment`,
      method: 'POST',
      body: { dealId, commentType, comment },
      headers,
    })
    .then((res) => res);

const submitDealAfterUkefIds = (dealId, dealType, checker, token) =>
  cy
    .request({
      url: `${tfmApiUrl()}/v1/deals/submitDealAfterUkefIds`,
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

const tfmLogin = (username, password) =>
  cy
    .request({
      url: `${tfmApiUrl()}/v1/login`,
      method: 'POST',
      body: { username, password },
      headers,
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);

      return resp.body.token;
    });

const submitDealToTfm = (dealId, dealType) =>
  cy
    .request({
      url: `${centralApiUrl()}/v1/tfm/deals/submit`,
      method: 'PUT',
      body: { dealId, dealType },
      headers,
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

const addUnderwriterCommentToTfm = (dealId, underwriterComment) =>
  cy
    .request({
      url: `${centralApiUrl()}/v1/tfm/deals/${dealId}`,
      method: 'put',
      body: { dealUpdate: underwriterComment },
      headers,
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

export {
  login,
  fetchAllApplications,
  fetchApplicationById,
  fetchAllFacilities,
  updateApplication,
  setApplicationStatus,
  createApplication,
  createFacility,
  updateFacility,
  addCommentObjToDeal,
  submitDealAfterUkefIds,
  tfmLogin,
  submitDealToTfm,
  addUnderwriterCommentToTfm,
};
