const { MOCK_FACILITIES } = require('./mock-facilities');
const MOCK_BSS_FACILITIES_USD_CURRENCY = require('./mock-facilities-USD-currency');
const MOCK_CURRENCY_EXCHANGE_RATE = require('./mock-currency-exchange-rate');
const MOCK_USERS = require('./mock-users');
const MOCK_PREMIUM_SCHEDULE_RESPONSE = require('./mock-premium-schedule-response');
const MOCK_BANK_HOLIDAYS = require('./mock-bank-holidays');
const { MOCK_UTILISATION_REPORT } = require('./mock-utilisation-report');
const MOCK_CASH_CONTINGENT_FACILITIES = require('./mock-cash-contingent-facilities');
const ALL_MOCK_DEALS = require('./mock-deals');

const ALL_MOCK_FACILITIES = [...MOCK_FACILITIES, ...MOCK_BSS_FACILITIES_USD_CURRENCY, ...MOCK_CASH_CONTINGENT_FACILITIES];

/*
 * Note - We should look to update functions in this file to be a jest.fn(), and add common implementation to common-api-mocks.js
 * This is to allow easier bespoke mocking of api functions, aiding in refactoring, and ultimately allow us to just mock the endpoints themselves.
 */

module.exports = {
  findBankById: jest.fn(),
  findOneDeal: jest.fn(),
  findOnePortalDeal: (dealId) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId);
    return deal ? Promise.resolve(deal) : Promise.reject();
  },
  findOneGefDeal: (dealId) => {
    const mockDeal = ALL_MOCK_DEALS.find((d) => d._id === dealId);

    const deal = {
      _id: dealId,
      dealSnapshot: mockDeal,
    };

    return deal ? Promise.resolve(deal) : Promise.reject();
  },
  updatePortalDeal: (dealId, update) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId);

    const updatedDeal = {
      ...deal,
      ...update,
    };

    return Promise.resolve(updatedDeal);
  },
  updatePortalGefDeal: (dealId, update) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId);

    const updatedDeal = {
      ...deal,
      ...update,
    };

    return Promise.resolve(updatedDeal);
  },
  updatePortalDealStatus: (dealId, statusUpdate) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId);
    const updatedDeal = {
      ...deal,
      status: statusUpdate,
      previousStatus: deal.previousStatus,
    };
    return Promise.resolve(updatedDeal);
  },
  updatePortalFacility: (facilityId, facilityUpdate) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId);

    const updatedFacility = {
      ...facility,
      ...facilityUpdate,
    };

    return updatedFacility;
  },
  updatePortalFacilityStatus: (facilityId, statusUpdate) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId);
    const updatedFacility = {
      ...facility,
      previousStatus: facility.status,
      status: statusUpdate,
    };
    return Promise.resolve(updatedFacility);
  },
  updateGefFacility: ({ facilityUpdate }) => {
    return Promise.resolve(facilityUpdate);
  },
  addPortalDealComment: jest.fn(),
  addUnderwriterCommentToGefDeal: jest.fn(),
  queryDeals: jest.fn(),
  updateDeal: jest.fn(),
  updateDealSnapshot: (dealId, snapshotUpdate) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId);

    const dealIndex = ALL_MOCK_DEALS.findIndex((d) => d._id === dealId);

    const updatedDeal = {
      ...deal,
      dealSnapshot: snapshotUpdate,
    };

    ALL_MOCK_DEALS[dealIndex] = updatedDeal;

    return updatedDeal;
  },
  resetDealForApiTest: (dealId) => {
    const existingDeal = ALL_MOCK_DEALS.find((d) => d._id === dealId);

    const resetDeal = {
      _id: dealId,
      ...existingDeal,
      tfm: {},
    };

    const dealIndex = ALL_MOCK_DEALS.findIndex((d) => d._id === dealId);

    ALL_MOCK_DEALS[dealIndex] = resetDeal;

    return Promise.resolve(resetDeal);
  },
  submitDeal: (dealType, dealId) => ({
    _id: dealId,
    dealSnapshot: ALL_MOCK_DEALS.find((d) => d._id === dealId),
    tfm: {},
  }),
  findOneFacility: (facilityId) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId);

    return {
      _id: facilityId,
      facilitySnapshot: {
        ...facility,
        _id: facilityId,
        ukefFacilityId: '1234567890',
      },
      tfm: {
        ukefExposure: '1,234.00',
        ukefExposureCalculationTimestamp: '1606900616651',
        // exposurePeriodInMonths: '12',
        facilityValueInGBP: '123,45.00',
        bondIssuerPartyUrn: '456-test',
        bondBeneficiaryPartyUrn: '123-test',
        acbs: {
          facilityStage: 'Unissued',
          hasBeenIssued: false,
        },
      },
    };
  },
  findFacilitiesByDealId: (dealId) => {
    const facilities = ALL_MOCK_FACILITIES.filter((f) => f.dealId === dealId);

    const mapped = facilities.map((facility) => ({
      _id: facility._id,
      facilitySnapshot: {
        ...facility,
        _id: facility._id,
      },
      tfm: {},
    }));

    return mapped;
  },
  updateFacility: ({ facilityId, tfmUpdate }) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId);

    // for some reason 2 api tests act differently if tfmUpdate is *not* included in both
    // root object and in tfm object.
    return {
      _id: facilityId,
      facilitySnapshot: facility,
      tfmUpdate,
      tfm: {
        ...tfmUpdate,
      },
    };
  },
  updatePortalBssDealStatus: jest.fn(),
  updatePortalGefDealStatus: jest.fn(),
  getFacilityExposurePeriod: jest.fn(() => ({
    exposurePeriodInMonths: 12,
  })),
  getPartyDbInfo: ({ companyRegNo }) =>
    process.env.AUTOMATIC_SF_CUSTOMER_CREATION_ENABLED ?
      companyRegNo === 'NO_MATCH'
        ? false
        : [
          {
            partyUrn: 'testPartyUrn',
          },
        ]
      :
      companyRegNo === 'NO_MATCH'
        ? { status: 400, data: 'Failed to get party' }
        : {
          status: 200,
          data: [
            {
              partyUrn: 'testPartyUrn',
            },
          ],
        },
  findUser: (username) => {
    if (username === 'invalidUser') {
      return false;
    }

    return MOCK_USERS.find((user) => user.username === username);
  },
  findUserById: jest.fn(),
  findTeamMembers: jest.fn(),
  findOneTeam: jest.fn(),
  getCurrencyExchangeRate: () => ({
    exchangeRate: MOCK_CURRENCY_EXCHANGE_RATE,
  }),
  createACBS: jest.fn(() => ({})),
  issueACBSfacility: jest.fn(() =>
    Promise.resolve({
      acbsTaskLinks: {
        mockLinkUrl: 'mockLinkUrl',
      },
    }),
  ),
  getFunctionsAPI: jest.fn((statusQueryGetUri) =>
    Promise.resolve({
      runtimeStatus: 'Completed',
      name: statusQueryGetUri,
      output: {
        facilities: [{ facilityId: '1234' }],
      },
    }),
  ),
  createEstoreSite: (deal) => deal,
  getPremiumSchedule: jest.fn(() => MOCK_PREMIUM_SCHEDULE_RESPONSE),
  sendEmail: jest.fn((templateId, sendToEmailAddress, emailVariables) => {
    const mockResponse = {
      content: {
        body: {},
      },
      id: templateId,
      email: sendToEmailAddress,
      ...emailVariables,
      template: {},
    };

    return Promise.resolve(mockResponse);
  }),
  getBankHolidays: jest.fn(() => Promise.resolve(MOCK_BANK_HOLIDAYS)),
  getBanks: jest.fn(() => Promise.resolve([])),
  getUtilisationReportsReconciliationSummary: jest.fn(),
  getUtilisationReportById: jest.fn(() => Promise.resolve(MOCK_UTILISATION_REPORT)),
  updateUtilisationReportStatus: jest.fn(),
  getUtilisationReportReconciliationDetailsById: jest.fn(),
  addPaymentToFeeRecords: jest.fn(),
  generateKeyingData: jest.fn(),
  markKeyingDataAsDone: jest.fn(),
  markKeyingDataAsToDo: jest.fn(),
  getUtilisationReportWithFeeRecordsToKey: jest.fn(),
  getPaymentDetails: jest.fn(),
  deletePaymentById: jest.fn(),
  editPayment: jest.fn(),
  removeFeesFromPayment: jest.fn(),
  updateDealCancellation: jest.fn(),
  getDealCancellation: jest.fn(),
  deleteDealCancellation: jest.fn(),
  getSelectedFeeRecordsDetails: jest.fn(),
  addFeesToAnExistingPayment: jest.fn(),
  getFeeRecord: jest.fn(),
  updateFeeRecordCorrectionTransientFormData: jest.fn(),
};
