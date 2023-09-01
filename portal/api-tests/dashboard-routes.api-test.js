const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { NON_ADMIN_ROLES } = require('../server/constants');

const dealsRemoveFilterTestCases = [
  { fieldName: 'dealType', fieldValue: 'BSS-EWCS' },
  { fieldName: 'dealType', fieldValue: 'GEF' },
  { fieldName: 'submissionType', fieldValue: 'Automatic-Inclusion-Notice' },
  { fieldName: 'submissionType', fieldValue: 'Manual-Inclusion-Application' },
  { fieldName: 'submissionType', fieldValue: 'Manual-Inclusion-Notice' },
  { fieldName: 'status', fieldValue: 'All-statuses' },
  { fieldName: 'status', fieldValue: 'Draft' },
  { fieldName: 'status', fieldValue: 'Ready-for-Checkers-approval' },
  { fieldName: 'status', fieldValue: 'Further-Makers-input-required' },
  { fieldName: 'status', fieldValue: 'Submitted' },
  { fieldName: 'status', fieldValue: 'Acknowledged' },
  { fieldName: 'status', fieldValue: 'In-progress-by-UKEF' },
  { fieldName: 'status', fieldValue: 'Accepted-by-UKEF-(with-conditions)' },
  { fieldName: 'status', fieldValue: 'Accepted-by-UKEF-(without-conditions)' },
  { fieldName: 'status', fieldValue: 'Rejected-by-UKEF' },
  { fieldName: 'status', fieldValue: 'Abandoned' },
  { fieldName: 'createdBy', fieldValue: 'Created-by-you' },
];

const facilitiesRemoveFilterTestCases = [
  { fieldName: 'type', fieldValue: 'Cash' },
  { fieldName: 'type', fieldValue: 'Contingent' },
  { fieldName: 'type', fieldValue: 'Bond' },
  { fieldName: 'type', fieldValue: 'Loan' },
  { fieldName: 'deal.submissionType', fieldValue: 'Automatic-Inclusion-Notice' },
  { fieldName: 'deal.submissionType', fieldValue: 'Manual-Inclusion-Application' },
  { fieldName: 'deal.submissionType', fieldValue: 'Manual-Inclusion-Notice' },
  { fieldName: 'hasBeenIssued', fieldValue: 'true' },
  { fieldName: 'hasBeenIssued', fieldValue: 'false' },
  { fieldName: 'createdBy', fieldValue: 'Created-by-you' },
];

describe('dashboard routes', () => {
  describe('GET /', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/dashboard/deals' },
    });
  });

  describe('GET /dashboard', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/dashboard', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/dashboard/deals' },
    });
  });

  describe('GET /dashboard/deals', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/dashboard/deals', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/dashboard/deals/0' },
    });
  });

  describe('GET /dashboard/deals/clear-all-filters', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/dashboard/deals/clear-all-filters', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/dashboard/deals/0' },
    });
  });

  describe.each(dealsRemoveFilterTestCases)('GET /dashboard/deals/filters/remove/$fieldName/$fieldValue', ({ fieldName, fieldValue }) => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/dashboard/deals/filters/remove/${fieldName}/${fieldValue}`, {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/dashboard/deals/0' },
    });
  });

  describe('GET /dashboard/facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/dashboard/facilities', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/dashboard/facilities/0' },
    });
  });

  describe('GET /dashboard/facilities/clear-all-filters', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/dashboard/facilities/clear-all-filters', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/dashboard/facilities/0' },
    });
  });

  describe.each(facilitiesRemoveFilterTestCases)('GET /dashboard/facilities/filters/remove/$fieldName/$fieldValue', ({ fieldName, fieldValue }) => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/dashboard/facilities/filters/remove/${fieldName}/${fieldValue}`, {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/dashboard/facilities/0' },
    });
  });

  describe('GET /dashboard/deals/0', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/dashboard/deals/0', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /dashboard/deals/0', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/dashboard/deals/0'),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /dashboard/facilities/0', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/dashboard/facilities/0', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /dashboard/facilities/0', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/dashboard/facilities/0'),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
