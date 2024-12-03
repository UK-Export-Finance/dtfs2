import { HEADERS } from '@ukef/dtfs2-common';
import { SIGN_IN_TOKENS } from '../../fixtures/constants';
import { BANK1_CHECKER1_WITH_MOCK_ID } from '../../../../e2e-fixtures/portal-users.fixture';
import { UNDERWRITER_1_WITH_MOCK_ID } from '../../../../e2e-fixtures/tfm-users.fixture';

const portalApi = 'http://localhost:5001/v1';
const centralApiUrl = () => {
  const url = `${Cypress.config('baseUrl')}:${Cypress.config('centralApiPort')}`;
  return url;
};

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': Cypress.config('apiKey'),
};

const tfmApiUrl = () => {
  const url = `${Cypress.config('tfmApiProtocol')}${Cypress.config('tfmApiHost')}:${Cypress.config('tfmApiPort')}`;
  return url;
};

const completeLoginWithSignInLink = ({ token2fa, username }) => {
  const signInToken = SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_ONE;
  cy.overridePortalUserSignInTokenWithValidTokenByUsername({ username, newSignInToken: signInToken });
  cy.getUserByUsername(username).then(({ _id: userId }) =>
    cy
      .request({
        url: `${portalApi}/users/${userId}/sign-in-link/${signInToken}/login`,
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

const login = ({ username, password }) => {
  cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
  return cy
    .request({
      url: `${portalApi}/login`,
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

// Only extracts GEF deals
const fetchAllGefApplications = (token) =>
  cy
    .request({
      url: `${portalApi}/gef/application`,
      method: 'GET',
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        Authorization: token,
      },
    })
    .then((res) => res);

// Extracts all deal types
const fetchAllApplications = (token) =>
  cy
    .request({
      url: `${portalApi}/deals`,
      method: 'GET',
      body: {},
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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

// TODO: DTFS2-7112 this endpoint is obsolete and should be removed
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
      body: { dealId, dealType, checker: BANK1_CHECKER1_WITH_MOCK_ID },
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
      body: { dealUpdate: underwriterComment, auditDetails: { userType: 'tfm', id: UNDERWRITER_1_WITH_MOCK_ID._id } },
      headers,
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

export {
  login,
  fetchAllApplications,
  fetchAllGefApplications,
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
