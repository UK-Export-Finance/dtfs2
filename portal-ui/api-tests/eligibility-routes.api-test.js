jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  updateEligibilityCriteria: jest.fn(),
  updateEligibilityDocumentation: jest.fn(),
  downloadEligibilityDocumentationFile: jest.fn(),
}));

const { createApi } = require('@ukef/dtfs2-common/api-test');
const { ROLES } = require('@ukef/dtfs2-common');
const { PassThrough } = require('stream');
const mockProvide = require('./helpers/mockProvide');

mockProvide();

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/api');

const { get, post } = createApi(app);

const { MAKER } = ROLES;

const allRoles = Object.values(ROLES);

const _id = '64ef48ee17a3231be0ad48b3';

const eligibilityDocumentationGetByFieldnameAndFileNameTestCases = [
  { fieldname: 'validationErrors', filename: 'exampleFilename' },
  { fieldname: 'securityDetails', filename: 'exampleFilename' },
];

describe('eligibility routes', () => {
  beforeEach(() => {
    api.updateEligibilityCriteria.mockResolvedValue({
      _id,
      additionalRefName: 'Mock deal',
      eligibility: {
        status: 'Incomplete',
        criteria: [],
        validationErrors: { count: 0, errorList: {} },
      },
      supportingInformation: {
        validationErrors: { count: 0, errorList: {} },
        securityDetails: { exporter: '' },
      },
    });

    api.updateEligibilityDocumentation.mockResolvedValue({
      _id,
      additionalRefName: 'Mock deal',
      eligibility: {
        status: 'Incomplete',
        criteria: [],
        validationErrors: { count: 0, errorList: {} },
      },
      supportingInformation: {
        validationErrors: { count: 0, errorList: {} },
        securityDetails: { exporter: '' },
      },
    });

    api.downloadEligibilityDocumentationFile.mockImplementation(async (_dealId, _fieldname, filename) => {
      const fileStream = new PassThrough();
      fileStream.headers = { 'content-type': 'application/octet-stream' };

      process.nextTick(() => {
        fileStream.end(filename);
      });

      return fileStream;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /contract/:_id/eligibility/criteria', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/eligibility/criteria`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/eligibility/criteria', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/eligibility/criteria`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/eligibility/supporting-documentation` },
    });
  });

  describe('POST /contract/:_id/eligibility/criteria/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/eligibility/criteria/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/eligibility/supporting-documentation', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/eligibility/supporting-documentation`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/eligibility/supporting-documentation', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/eligibility/supporting-documentation`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/eligibility/check-your-answers` },
    });
  });

  describe('POST /contract/:_id/eligibility/supporting-documentation/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/eligibility/supporting-documentation/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe.each(eligibilityDocumentationGetByFieldnameAndFileNameTestCases)(
    'GET /contract/:_id/eligibility-documentation/$fieldname/$filename',
    ({ fieldname, filename }) => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(`/contract/${_id}/eligibility-documentation/${fieldname}/${filename}`, {}, headers),
        whitelistedRoles: allRoles,
        successCode: 200,
      });
    },
  );

  describe('GET /contract/:_id/eligibility/check-your-answers', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/eligibility/check-your-answers`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
