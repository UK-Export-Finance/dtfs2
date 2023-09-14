const { MAKER, CHECKER, READ_ONLY } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const dealId = 'dealId-test-value';

describe('application details routes', () => {
describe('GET /application-details/:dealId', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}`, {}, headers),
    whitelistedRoles: [MAKER, CHECKER, READ_ONLY],
    successCode: 200,
    disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
  });
});

describe('POST /application-details/:dealId', () => {
  withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}`),
        whitelistedRoles: [MAKER, CHECKER],
        successCode: 200,
        disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
      });
});
});