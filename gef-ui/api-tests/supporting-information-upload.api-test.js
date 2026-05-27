jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

const request = require('supertest');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const cloneMock = (value) => JSON.parse(JSON.stringify(value));

const { post } = createApi(app);

const dealId = '123';
const documentType = 'manual-inclusion-questionnaire';

describe('supporting information upload routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
    api.getFacilities.mockResolvedValue({ status: 'Completed', items: [] });
    api.getUserDetails.mockResolvedValue({ _id: '619bae3467cc7c002069fc21', firstname: 'Checker', surname: 'One' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /application-details/:dealId/supporting-information/document/:documentType/upload', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) =>
        request(app)
          .post(`/application-details/${dealId}/supporting-information/document/${documentType}/upload`)
          .set(headers)
          .attach('documents', Buffer.from('test'), 'test.exe'),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /application-details/:dealId/supporting-information/document/:documentType/delete', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) =>
        post({ delete: 'mock-file.pdf' }, headers).to(`/application-details/${dealId}/supporting-information/document/${documentType}/delete`),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
