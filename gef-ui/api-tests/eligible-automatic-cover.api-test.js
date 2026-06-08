const { createApi } = require('@ukef/dtfs2-common/api-test');
const { HttpStatusCode } = require('axios');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');

const { get } = createApi(app);

const dealId = '123';

describe('eligible automatic cover routes', () => {
  describe('GET /application-details/:dealId/eligible-automatic-cover', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/eligible-automatic-cover`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('GET /application-details/:dealId/ineligible-automatic-cover', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/ineligible-automatic-cover`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('GET /ineligible-gef', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/ineligible-gef', {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });
});
