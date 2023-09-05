jest.mock('../server/routes/api-data-provider', () => ({
  ...(jest.requireActual('../server/routes/api-data-provider')),
  provide: () => (req, res, next) => next(),
}));

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

const _id = '64ef48ee17a3231be0ad48b3';

const eligibilityDocumentationGetByFieldnameAndFileNameTestCases = [
  { fieldname: 'validationErrors', filename: 'exampleFilename' },
  { fieldname: 'securityDetails', filename: 'exampleFilename' },
];

describe('eligibility routes', () => {
  describe('GET /contract/:_id/eligibility/criteria', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/eligibility/criteria`, {}, headers),
      whitelistedRoles: ['maker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/eligibility/criteria', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/eligibility/criteria`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/eligibility/supporting-documentation` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/eligibility/criteria/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/eligibility/criteria/save-go-back`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/eligibility/supporting-documentation', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/eligibility/supporting-documentation`, {}, headers),
      whitelistedRoles: ['maker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/eligibility/supporting-documentation', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/eligibility/supporting-documentation`),
      whitelistedRoles: ROLES,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/eligibility/supporting-documentation/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/eligibility/supporting-documentation/save-go-back`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe.each(eligibilityDocumentationGetByFieldnameAndFileNameTestCases)('GET /contract/:_id/eligibility-documentation/$fieldname/$filename', ({ fieldname, filename }) => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/:_id/eligibility-documentation/${fieldname}/${filename}`, {}, headers),
      whitelistedRoles: ROLES,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/eligibility/check-your-answers', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/eligibility/check-your-answers`, {}, headers),
      whitelistedRoles: ['maker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
