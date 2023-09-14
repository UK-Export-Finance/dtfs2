const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const dealId = 'dealId-test-value';
const documentType = 'documentType-test-value';

describe('supporting information routes', () => {
describe('GET /application-details/:dealId/supporting-information/document/:documentType', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/supporting-information/document/${documentType}`, {}, headers),
    whitelistedRoles: [MAKER],
    successCode: 200,
    disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
  });
});

describe('POST /application-details/:dealId/supporting-information/document/:documentType', () => {
  withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/supporting-information/document/${documentType}`),
        whitelistedRoles: [MAKER],
        successCode: 200,
        disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
      });
});
});