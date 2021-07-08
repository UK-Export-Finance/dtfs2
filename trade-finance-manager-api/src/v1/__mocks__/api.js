const MOCK_DEAL = require('./mock-deal');
const MOCK_DEAL_NO_PARTY_DB = require('./mock-deal-no-party-db');
const MOCK_DEAL_NO_COMPANIES_HOUSE = require('./mock-deal-no-companies-house');
const MOCK_DEAL_FACILITIES_USD_CURRENCY = require('./mock-deal-facilities-USD-currency');
const MOCK_DEAL_ISSUED_FACILITIES = require('./mock-deal-issued-facilities');
const MOCK_FACILITIES = require('./mock-facilities');
const MOCK_FACILITIES_USD_CURRENCY = require('./mock-facilities-USD-currency');
const MOCK_DEAL_MIN = require('./mock-deal-MIN');
const MOCK_DEAL_MIA_SUBMITTED = require('./mock-deal-MIA-submitted');
const MOCK_DEAL_MIA_NOT_SUBMITTED = require('./mock-deal-MIA-not-submitted');
const MOCK_DEAL_AIN_SUBMITTED = require('./mock-deal-AIN-submitted');
const MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE = require('./mock-deal-AIN-submitted-non-gbp-contract-value');
const MOCK_CURRENCY_EXCHANGE_RATE = require('./mock-currency-exchange-rate');
const MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('./mock-deal-AIN-second-submit-facilities-unissued-to-issued');
const MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('./mock-deal-MIA-second-submit-facilities-unissued-to-issued');
const MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('./mock-deal-MIN-second-submit-facilities-unissued-to-issued');
const MOCK_MIA_SUBMITTED = require('./mock-deal-MIA-submitted');
const MOCK_MIA_SECOND_SUBMIT = require('./mock-deal-MIA-second-submit');
const MOCK_AIN_TASKS = require('./mock-AIN-tasks');
const MOCK_MIA_TASKS = require('./mock-MIA-tasks');
const MOCK_USERS = require('./mock-users');
const MOCK_TEAMS = require('./mock-teams');
const MOCK_PREMIUM_SCHEUDLE_RESPONSE = require('./mock-premium-schedule-response');

const ALL_MOCK_DEALS = [
  MOCK_DEAL,
  MOCK_DEAL_NO_PARTY_DB,
  MOCK_DEAL_NO_COMPANIES_HOUSE,
  MOCK_DEAL_FACILITIES_USD_CURRENCY,
  MOCK_DEAL_ISSUED_FACILITIES,
  MOCK_DEAL_MIN,
  MOCK_DEAL_MIA_SUBMITTED,
  MOCK_DEAL_MIA_NOT_SUBMITTED,
  MOCK_DEAL_AIN_SUBMITTED,
  MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE,
  MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED,
  MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED,
  MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED,
  MOCK_MIA_SUBMITTED,
  MOCK_MIA_SECOND_SUBMIT,
];

const ALL_MOCK_FACILITIES = [
  ...MOCK_FACILITIES,
  ...MOCK_FACILITIES_USD_CURRENCY,
];

module.exports = {
  findOneDeal: (dealId) => {
    const mockDeal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle

    let tfmHistory = { tasks: [], emails: [] };
    let tfmStage;

    if (mockDeal && mockDeal.tfm && mockDeal.tfm.history) {
      tfmHistory = {
        ...tfmHistory,
        ...mockDeal.tfm.history,
      };
    }

    if (mockDeal && mockDeal.tfm && mockDeal.tfm.stage) {
      tfmStage = mockDeal.tfm.stage;
    }

    const deal = {
      _id: dealId,
      dealSnapshot: mockDeal,
      tfm: {
        tasks: MOCK_AIN_TASKS,
        exporterCreditRating: 'Good (BB-)',
        supplyContractValueInGBP: '7287.56740999854',
        parties: {
          exporter: {
            partyUrn: '1111',
          },
        },
        bondIssuerPartyUrn: '',
        bondBeneficiaryPartyUrn: '',
        history: tfmHistory,
        stage: tfmStage,
      },
    };

    if (deal.dealSnapshot && deal.dealSnapshot._id === 'MOCK_MIA_SECOND_SUBMIT') {
      if (deal.dealSnapshot.details.submissionType === 'Manual Inclusion Application' && deal.dealSnapshot.details.submissionCount === 2) {
        deal.tfm.underwriterManagersDecision = {
          decision: 'Approved (without conditions)',
        };

        deal.tfm.tasks = MOCK_MIA_TASKS;
      }
    }

    if (deal.dealSnapshot && deal.dealSnapshot._id === 'MOCK_MIA_SUBMITTED') {
      if (deal.tfm && !deal.tfm.tasks) {
        deal.tfm.tasks = MOCK_MIA_TASKS;
      }
    }

    return mockDeal ? Promise.resolve(deal) : Promise.reject();
  },
  findOnePortalDeal: (dealId) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return deal ? Promise.resolve(deal) : Promise.reject();
  },
  updatePortalDeal: (dealId, update) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle

    const updatedDeal = {
      ...deal,
      ...update,
    };

    return Promise.resolve(updatedDeal);
  },
  updatePortalDealStatus: (dealId, statusUpdate) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    const updatedDeal = {
      ...deal,
      details: {
        ...deal.details,
        status: statusUpdate,
        previousStatus: deal.details.previousStatus,
      },
    };
    return Promise.resolve(updatedDeal);
  },
  updatePortalFacility: (facilityId, facilityUpdate) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId); // eslint-disable-line no-underscore-dangle

    const updatedFacility = {
      ...facility,
      ...facilityUpdate,
    };

    return updatedFacility;
  },
  updatePortalFacilityStatus: (facilityId, statusUpdate) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId); // eslint-disable-line no-underscore-dangle
    const updatedFacility = {
      ...facility,
      previousStatus: facility.status,
      status: statusUpdate,
    };
    return Promise.resolve(updatedFacility);
  },
  addPortalDealComment: (dealId) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle

    return Promise.resolve(deal);
  },
  queryDeals: () => ALL_MOCK_DEALS,
  updateDeal: (dealId, updatedTfmDealData) => {
    let deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle

    // if history or stage is updated, add to the mock deal.
    if (updatedTfmDealData.tfm) {
      if (updatedTfmDealData.tfm.history
        || updatedTfmDealData.tfm.stage) {
        const dealIndex = ALL_MOCK_DEALS.findIndex((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle

        deal = {
          ...deal,
          tfm: {
            ...updatedTfmDealData.tfm,
            tasks: updatedTfmDealData.tfm.tasks,
            history: updatedTfmDealData.tfm.history,
          },
        };
        ALL_MOCK_DEALS[dealIndex] = deal;
      }
    }

    return {
      dealSnapshot: {
        ...deal,
      },
      ...updatedTfmDealData,
    };
  },
  updateDealSnapshot: (dealId, snapshotUpdate) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle

    const dealIndex = ALL_MOCK_DEALS.findIndex((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle

    const updatedDeal = {
      ...deal,
      dealSnapshot: snapshotUpdate,
    };

    ALL_MOCK_DEALS[dealIndex] = updatedDeal;

    return updatedDeal;
  },
  resetDealForApiTest: (dealId) => {
    const existingDeal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle

    const resetDeal = {
      _id: dealId,
      ...existingDeal,
      tfm: {},
    };

    const dealIndex = ALL_MOCK_DEALS.findIndex((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle

    ALL_MOCK_DEALS[dealIndex] = resetDeal;

    return Promise.resolve(resetDeal);
  },
  submitDeal: (dealId) => ({
    _id: dealId,
    // eslint-disable-next-line no-underscore-dangle
    dealSnapshot: ALL_MOCK_DEALS.find((d) => d._id === dealId),
    tfm: {
      history: {
        tasks: [],
        emails: [],
      },
    },
  }),
  findOneFacility: (facilityId) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId); // eslint-disable-line no-underscore-dangle

    return {
      _id: facilityId,
      facilitySnapshot: {
        ...facility,
        _id: facilityId,
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
        },
      },
    };
  },
  updateFacility: (facilityId, tfmUpdate) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId); // eslint-disable-line no-underscore-dangle

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
  getFacilityExposurePeriod: jest.fn(() => (
    {
      exposurePeriodInMonths: 12,
    }
  )),
  getPartyDbInfo: ({ companyRegNo }) => (
    companyRegNo === 'NO_MATCH'
      ? false
      : [{
        partyUrn: 'testPartyUrn',
      }]
  ),
  findUser: (username) => {
    if (username === 'invalidUser') {
      return false;
    }

    return MOCK_USERS.find((user) => user.username === username);
  },
  findUserById: (userId) =>
    MOCK_USERS.find((user) => user._id === userId), // eslint-disable-line no-underscore-dangle
  findTeamMembers: (teamId) =>
    MOCK_USERS.filter((user) => user.teams.includes(teamId)),
  findOneTeam: (teamId) =>
    MOCK_TEAMS.find((team) => team.id === teamId),
  getCurrencyExchangeRate: () => ({
    midPrice: MOCK_CURRENCY_EXCHANGE_RATE,
  }),
  createACBS: jest.fn(() => ({})),
  updateACBSfacility: jest.fn(() => Promise.resolve({
    acbsTaskLinks: {
      mockLinkUrl: 'mockLinkUrl',
    },
  })),
  getFunctionsAPI: jest.fn((statusQueryGetUri) => Promise.resolve({
    runtimeStatus: 'Completed',
    name: statusQueryGetUri,
    output: {
      facilities: [
        { facilityId: '1234' },
      ],
    },
  })),
  createEstoreFolders: (deal) => deal,
  getPremiumSchedule: jest.fn(() => MOCK_PREMIUM_SCHEUDLE_RESPONSE),
  sendEmail: jest.fn((
    templateId,
    sendToEmailAddress,
    emailVariables,
  ) => {
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
};
