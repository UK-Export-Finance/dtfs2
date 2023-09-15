const { MAKER, CHECKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);

const fileId = 'fileId-test-value';

describe('downloadFile routes', () => {
  describe('GET /file/:fileId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/file/${fileId}`, {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });
});
