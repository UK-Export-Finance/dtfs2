jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  createLoan: jest.fn().mockResolvedValue({ dealId: '64ef48ee17a3231be0ad48b3', loanId: '64ef48ee17a3231be0ad48c4' }),
  updateLoan: jest.fn().mockResolvedValue({}),
  updateLoanIssueFacility: jest.fn().mockResolvedValue({}),
  updateLoanCoverStartDate: jest.fn().mockResolvedValue({ validationErrors: { count: 0, errorList: {} } }),
  deleteLoan: jest.fn().mockResolvedValue({}),
}));
jest.mock('../../server/routes/api-data-provider', () => {
  const actual = jest.requireActual('../../server/routes/api-data-provider');

  const mockDeal = {
    _id: '64ef48ee17a3231be0ad48b3',
    additionalRefName: 'Mock deal',
    mandatoryCriteria: [],
    status: 'Draft',
    details: {
      status: 'Draft',
      submissionDate: undefined,
    },
    submissionDetails: {
      supplyContractCurrency: { id: 'GBP', text: 'GBP' },
      supplyContractValue: '1000',
    },
    bondTransactions: { items: [] },
    loanTransactions: { items: [] },
    eligibility: {
      status: 'Incomplete',
      criteria: [],
      validationErrors: { count: 0, errorList: {} },
    },
    supportingInformation: {
      validationErrors: { count: 0, errorList: {} },
    },
  };

  const mockSubmittedDeal = {
    ...mockDeal,
    status: 'Accepted by UKEF (with conditions)',
    submissionType: 'Automatic Inclusion Notice',
    details: {
      status: 'Accepted by UKEF (with conditions)',
      submissionDate: '2024-01-01T00:00:00.000Z',
    },
  };

  const mockLoan = {
    status: 'Not started',
    facilityStage: 'Unconditional',
    issueFacilityDetailsSubmitted: false,
    currency: { id: 'GBP', text: 'GBP' },
    value: '1000',
    currencySameAsSupplyContractCurrency: 'true',
    interestMarginFee: '1',
    coveredPercentage: '80',
    premiumType: 'With a schedule',
    premiumFrequency: '6 months',
    dayCountBasis: '30/360',
    requestedCoverStartDate: '2024-01-01T00:00:00.000Z',
    'requestedCoverStartDate-day': '1',
    'requestedCoverStartDate-month': '1',
    'requestedCoverStartDate-year': '2024',
  };

  const mockIssueFacilityLoan = {
    ...mockLoan,
    status: "Maker's input required",
  };

  return {
    ...actual,
    provide: (listOfDataTypes) => async (req, res, next) => {
      req.apiData = req.apiData || {};

      const isIssueFacilityRoute = req.originalUrl.includes('/loan/') && req.originalUrl.includes('/issue-facility');

      if (listOfDataTypes.includes(actual.DEAL)) {
        req.apiData.deal = isIssueFacilityRoute ? mockSubmittedDeal : mockDeal;
      }

      if (listOfDataTypes.includes(actual.LOAN)) {
        req.apiData.loan = {
          dealId: mockDeal._id,
          loan: isIssueFacilityRoute ? mockIssueFacilityLoan : mockLoan,
          validationErrors: { count: 0, errorList: {} },
        };
      }

      if (listOfDataTypes.includes(actual.CURRENCIES)) {
        req.apiData.currencies = [{ id: 'GBP', text: 'GBP' }];
      }

      return next();
    },
  };
});

const { ROLES } = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');

const app = require('../../server/createApp');

const { get, post } = createApi(app);

const { MAKER } = ROLES;

const allRoles = Object.values(ROLES);

const _id = '64ef48ee17a3231be0ad48b3';
const loanId = '64ef48ee17a3231be0ad48c4';

describe('loan routes', () => {
  describe('GET /contract/:_id/loan/create', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/create`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/loan/${loanId}/guarantee-details` },
    });
  });

  describe('GET /contract/:_id/loan/:loanId/guarantee-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/guarantee-details`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/loan/:loanId/guarantee-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/guarantee-details`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/loan/${loanId}/financial-details` },
    });
  });

  describe('POST /contract/:_id/loan/:loanId/guarantee-details/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/guarantee-details/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/loan/:loanId/financial-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/financial-details`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/loan/:loanId/financial-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/financial-details`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/loan/${loanId}/dates-repayments` },
    });
  });

  describe('POST /contract/:_id/loan/:loanId/financial-details/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/financial-details/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/loan/:loanId/dates-repayments', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/dates-repayments`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/loan/:loanId/dates-repayments', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/dates-repayments`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/loan/${loanId}/check-your-answers` },
    });
  });

  describe('POST /contract/:_id/loan/:loanId/dates-repayments/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/dates-repayments/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/loan/:loanId/check-your-answers', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/check-your-answers`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('GET /contract/:_id/loan/:loanId/issue-facility', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/issue-facility`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/loan/:loanId/issue-facility', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/issue-facility`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/loan/:loanId/confirm-requested-cover-start-date', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/confirm-requested-cover-start-date`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/loan/:loanId/confirm-requested-cover-start-date', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) =>
        post({ needToChangeRequestedCoverStartDate: 'false' }, headers).to(`/contract/${_id}/loan/${loanId}/confirm-requested-cover-start-date`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/loan/:loanId/delete', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/delete`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      redirectUrlForInvalidRoles: `/contract/${_id}`,
    });
  });

  describe('POST /contract/:_id/loan/:loanId/delete', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/delete`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });
});
