const { DURABLE_FUNCTIONS_LOG } = require('@ukef/dtfs2-common');
const api = require('../api');
const CONSTANTS = require('../../constants');
const MOCK_DEAL_ACBS = require('../__mocks__/mock-deal-acbs');

const { createACBS, issueAcbsFacilities, addToACBSLog, updateIssuedFacilityAcbs, updateAmendedFacilityAcbs } = require('./acbs.controller');
const { mongoDbClient: db } = require('../../drivers/db-client');
const { findOneTfmDeal } = require('./deal.controller');
const { updateFacilityAcbs } = require('./tfm.controller');

const consoleErrorMock = jest.spyOn(console, 'error');
consoleErrorMock.mockImplementation();

const consoleInfoMock = jest.spyOn(console, 'info');
consoleInfoMock.mockImplementation();

const insertOneMock = jest.fn().mockResolvedValue(true);
const getCollectionMock = jest.spyOn(db, 'getCollection');
getCollectionMock.mockResolvedValue({ insertOne: insertOneMock });

const createAcbsApiMock = jest.fn().mockResolvedValue(123);
const createACBSMock = jest.spyOn(api, 'createACBS');
createACBSMock.mockResolvedValue(createAcbsApiMock);

/**
 * Mock `deal.controller` imperative functions to
 * expedite unit test execution and keep it in function
 * scope.
 */
jest.mock('./deal.controller', () => ({
  findOneTfmDeal: jest.fn(),
}));

/**
 * Mock `tfm.controller` imperative functions to
 * expedite unit test execution and keep it in function
 * scope.
 */
jest.mock('./tfm.controller', () => ({
  updateFacilityAcbs: jest.fn().mockResolvedValue(true),
}));

const mockAcbsTaskLink = {
  id: '5ce819935e539c343f141ece',
  statusQueryGetUri: 'acbs',
  sendEventPostUri: 'acbs',
  terminatePostUri: 'acbs',
  rewindPostUri: 'acbs',
  purgeHistoryDeleteUri: 'acbs',
};

const mockAcbsFacilityIssueTask = {
  acbsTaskResult: {
    name: 'acbs-issue-facility',
    instanceId: 'c2e8705d3813421385da3bff2073121a',
    runtimeStatus: DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED,
    customStatus: null,
    createdTime: '2024-12-11T16:00:27Z',
    lastUpdatedTime: '2024-12-11T16:00:50Z',
    input: {
      facilityIdentifier: '0041231975',
      amendment: {
        facility: {
          _id: '77e10af22d146b1bb8f0fcf8',
        },
        deal: {},
      },
    },
    output: {
      facilityIdentifier: '0041231975',
      issuedFacilityMaster: {
        status: 200,
        updateType: 'issue',
        submittedToACBS: '2024-09-20T16:00:32+00:00',
        receivedFromACBS: '2024-09-20T16:00:37+00:00',
        dataSent: {
          dealIdentifier: '0041231974',
          facilityIdentifier: '0041231975',
          portfolioIdentifier: 'E1',
          dealBorrowerIdentifier: '001234567',
          maximumLiability: 100000,
          productTypeId: '280',
          capitalConversionFactorCode: '8',
          currency: 'GBP',
          guaranteeCommencementDate: '2024-09-20',
          guaranteeExpiryDate: '2025-09-20',
          nextQuarterEndDate: '2024-12-31',
          facilityInitialStatus: 'P',
          facilityOverallStatus: 'A',
          delegationType: 'A',
          interestOrFeeRate: 2.1,
          facilityStageCode: '07',
          exposurePeriod: '22',
          creditRatingCode: '10',
          guaranteePercentage: 75,
          premiumFrequencyCode: '2',
          riskCountryCode: 'GBR',
          riskStatusCode: '03',
          effectiveDate: '2024-09-10',
          forecastPercentage: 100,
          issueDate: '2024-09-20',
          description: 'GEF : 24 Months',
          agentBankIdentifier: '00000000',
          obligorPartyIdentifier: '00123456',
          obligorName: 'TEST',
          obligorIndustryClassification: '1234',
          probabilityOfDefault: 1.0,
          productTypeName: 'GEF',
        },
        facilityIdentifier: '0041231975',
      },
      facilityLoan: {
        status: 201,
        dataSent: {
          postingDate: '2024-09-20',
          borrowerPartyIdentifier: '00123456',
          productTypeId: '280',
          productTypeGroup: 'GM',
          currency: 'GBP',
          amount: 10000,
          issueDate: '2024-09-20',
          expiryDate: '2025-09-20',
          spreadRate: 1.23,
          nextDueDate: '2025-01-01',
          yearBasis: '1',
          loanBillingFrequencyType: 'E',
        },
        submittedToACBS: '2024-09-20T16:00:37+00:00',
        receivedFromACBS: '2024-09-20T16:00:44+00:00',
        bundleIdentifier: '0000412345',
      },
      facilityFee: {
        status: 201,
        dataSent: {
          effectiveDate: '2024-09-20',
          amount: 3348,
          expirationDate: '2025-09-20',
          nextDueDate: '2025-09-20',
          nextAccrueToDate: '2025-09-20',
          period: '01',
          currency: 'GBP',
          lenderTypeCode: '100',
          incomeClassCode: 'FGT',
          spreadToInvestorsIndicator: true,
        },
        submittedToACBS: '2024-09-20T16:00:44+00:00',
        receivedFromACBS: '2024-09-20T16:00:50+00:00',
        facilityIdentifier: '0000412346',
      },
    },
    auditRecord: {
      lastUpdatedAt: '2024-12-13T08:40:00.194 +00:00',
      lastUpdatedByPortalUserId: null,
      lastUpdatedByTfmUserId: null,
      lastUpdatedByIsSystem: true,
      noUserLoggedIn: null,
    },
  },
};

const updateACBSFacilityMock = jest.spyOn(api, 'issueACBSfacility');
updateACBSFacilityMock.mockResolvedValue(mockAcbsTaskLink);

const invalidDealIds = ['invalid', '', '0000000000', '123', 'ABC', '!"£', [], {}];

describe('addToACBSLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const payloads = [
    {},
    [],
    null,
    undefined,
    '123',
    '!£$',
    123,
    {
      deal: {},
      acbsTaskLinks: {},
    },
    {
      deal: {
        _id: 'invalid',
      },
      acbsTaskLinks: {},
    },
    {
      deal: {
        _id: '5ce819935e539c343f141ece',
      },
      acbsTaskLinks: {},
    },
    {
      deal: {
        _id: '5ce819935e539c343f141ece',
      },
      acbsTaskLinks: {
        statusQueryGetUri: '123',
      },
    },
  ];

  it.each(payloads)('should return false when sending a malformed payload', async (payload) => {
    const result = await addToACBSLog(payload);

    expect(getCollectionMock).toHaveBeenCalledTimes(0);
    expect(insertOneMock).toHaveBeenCalledTimes(0);
    expect(result).toEqual(false);
  });

  it('should add an entry to the `durable-functions-log` collection', async () => {
    const payload = {
      deal: {
        _id: '5ce819935e539c343f141ece',
      },
      acbsTaskLinks: mockAcbsTaskLink,
    };

    const result = await addToACBSLog(payload);

    expect(getCollectionMock).toHaveBeenCalledTimes(1);
    expect(insertOneMock).toHaveBeenCalledTimes(1);
    expect(insertOneMock).toHaveBeenCalledWith({
      type: DURABLE_FUNCTIONS_LOG.TYPE.ACBS,
      dealId: payload.deal._id,
      deal: payload.deal,
      facility: {},
      bank: {},
      status: DURABLE_FUNCTIONS_LOG.STATUS.RUNNING,
      instanceId: mockAcbsTaskLink.id,
      acbsTaskLinks: mockAcbsTaskLink,
      submittedDate: expect.any(String),
      auditRecord: expect.any(Object),
    });

    expect(result).toEqual(true);
  });
});

describe('issueAcbsFacilities', () => {
  const invalidDeals = [
    {},
    {
      tfm: {},
    },
    {
      tfm: {
        estore: {
          siteName: '123',
        },
      },
    },
    [],
    null,
    undefined,
    123,
    'ABC',
    '!£$',
  ];

  const mockDeal = {
    _id: '5ce819935e539c343f141ece',
    facilities: [
      {
        hasBeenIssued: true,
        tfm: {
          acbs: {
            facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.COMMITMENT,
          },
        },
      },
    ],
    tfm: {
      acbs: {},
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(invalidDeals)('should return false if the deal object is invalid', async (deal) => {
    // Act
    const result = await issueAcbsFacilities(deal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledWith('Unable to issue deal %s facility to ACBS.', undefined);
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleInfoMock).toHaveBeenCalledTimes(0);
    expect(result).toEqual(false);
  });

  it('should call issueACBSfacility', async () => {
    // Act
    const result = await issueAcbsFacilities(mockDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);
    expect(consoleInfoMock).toHaveBeenCalledWith('✅ Submitting deal %s facility to ACBS.', mockDeal._id);
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);

    expect(updateACBSFacilityMock).toHaveBeenCalledTimes(1);
    expect(updateACBSFacilityMock).toHaveBeenCalledWith(mockDeal.facilities[0], { dealSnapshot: {}, exporter: {} });

    expect(insertOneMock).toHaveBeenCalledTimes(1);
    expect(insertOneMock).toHaveBeenCalledWith({
      type: DURABLE_FUNCTIONS_LOG.TYPE.ACBS,
      dealId: mockDeal._id,
      deal: mockDeal,
      facility: {},
      bank: {},
      status: DURABLE_FUNCTIONS_LOG.STATUS.RUNNING,
      instanceId: mockAcbsTaskLink.id,
      acbsTaskLinks: mockAcbsTaskLink,
      submittedDate: expect.any(String),
      auditRecord: expect.any(Object),
    });

    expect(result).toEqual([true]);
  });

  it('should not call issueACBSfacility if acbs property does not exist', async () => {
    // Deal has not been created in ACBS
    const mockAcbsDeal = {
      ...mockDeal,
      tfm: {},
    };

    // Act
    const result = await issueAcbsFacilities(mockAcbsDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(updateACBSFacilityMock).toHaveBeenCalledTimes(0);
    expect(consoleInfoMock).toHaveBeenCalledTimes(0);
    expect(insertOneMock).toHaveBeenCalledTimes(0);

    expect(result).toEqual(false);
  });

  it('should not call issueACBSfacility if the facility is not issued in Portal', async () => {
    // Arrange
    const mockAcbsDeal = {
      ...mockDeal,
      facilities: [
        {
          tfm: {
            acbs: {
              facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.COMMITMENT,
            },
          },
        },
      ],
    };

    // Act
    const result = await issueAcbsFacilities(mockAcbsDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);
    expect(updateACBSFacilityMock).toHaveBeenCalledTimes(0);
    expect(consoleInfoMock).toHaveBeenCalledWith('✅ Submitting deal %s facility to ACBS.', mockAcbsDeal._id);
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(insertOneMock).toHaveBeenCalledTimes(0);

    expect(result).toEqual(false);
  });

  it('should not call issueACBSfacility if the facility is not created in ACBS', async () => {
    // Arrange
    const mockAcbsDeal = {
      ...mockDeal,
      facilities: [
        {
          tfm: {
            acbs: {
              hasBeenIssued: true,
            },
          },
        },
      ],
    };

    // Act
    const result = await issueAcbsFacilities(mockAcbsDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);
    expect(updateACBSFacilityMock).toHaveBeenCalledTimes(0);
    expect(consoleInfoMock).toHaveBeenCalledWith('✅ Submitting deal %s facility to ACBS.', mockAcbsDeal._id);
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(insertOneMock).toHaveBeenCalledTimes(0);

    expect(result).toEqual(false);
  });

  it('should not call issueACBSfacility if the facility is issued in ACBS', async () => {
    // Arrange
    const mockAcbsDeal = {
      ...mockDeal,
      facilities: [
        {
          tfm: {
            acbs: {
              hasBeenIssued: true,
              facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.ISSUED,
            },
          },
        },
      ],
    };

    // Act
    const result = await issueAcbsFacilities(mockAcbsDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);
    expect(updateACBSFacilityMock).toHaveBeenCalledTimes(0);
    expect(consoleInfoMock).toHaveBeenCalledWith('✅ Submitting deal %s facility to ACBS.', mockAcbsDeal._id);
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(insertOneMock).toHaveBeenCalledTimes(0);

    expect(result).toEqual(false);
  });

  it('should not call issueACBSfacility if the facility is risk expired in ACBS', async () => {
    // Arrange
    const mockAcbsDeal = {
      ...mockDeal,
      facilities: [
        {
          tfm: {
            acbs: {
              hasBeenIssued: true,
              facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.RISK_EXPIRED,
            },
          },
        },
      ],
    };

    // Act
    const result = await issueAcbsFacilities(mockAcbsDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);
    expect(updateACBSFacilityMock).toHaveBeenCalledTimes(0);
    expect(consoleInfoMock).toHaveBeenCalledWith('✅ Submitting deal %s facility to ACBS.', mockAcbsDeal._id);
    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(insertOneMock).toHaveBeenCalledTimes(0);

    expect(result).toEqual(false);
  });
});

describe('createACBS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(invalidDealIds)('should return false for deal with an invalid Mongo Object deal id %s', async (dealId) => {
    // Act
    const result = await createACBS(dealId);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return false if the deal is not found', async () => {
    // Arrange
    findOneTfmDeal.mockResolvedValue(null);

    // Act
    const result = await createACBS(MOCK_DEAL_ACBS._id);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return false if the deal does not have `dealSnapshot` property', async () => {
    // Arrange
    findOneTfmDeal.mockResolvedValue({
      tfm: {},
    });

    // Act
    const result = await createACBS(MOCK_DEAL_ACBS._id);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return false if the deal does not have `dealSnapshot.bank` property', async () => {
    // Arrange
    findOneTfmDeal.mockResolvedValue({
      dealSnapshot: {},
      tfm: {},
    });

    // Act
    const result = await createACBS(MOCK_DEAL_ACBS._id);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return false if the deal does not have `tfm` property', async () => {
    // Arrange
    findOneTfmDeal.mockResolvedValue({
      _id: MOCK_DEAL_ACBS._id,
      dealSnapshot: {
        bank: {
          id: '1',
          name: '2',
          partyUrn: '3',
        },
      },
    });

    // Act
    const result = await createACBS(MOCK_DEAL_ACBS._id);

    // Assert
    expect(result).toEqual(false);
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith('Invalid ACBS deal payload, terminating API call for deal %s', MOCK_DEAL_ACBS._id);
  });

  it('should return false if the bank does not have `partyUrn` property', async () => {
    // Arrange
    findOneTfmDeal.mockResolvedValue({
      _id: MOCK_DEAL_ACBS._id,
      dealSnapshot: {
        bank: {
          id: '1',
          name: '2',
        },
      },
      tfm: {},
    });

    // Act
    const result = await createACBS(MOCK_DEAL_ACBS._id);

    // Assert
    expect(result).toEqual(false);
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith('Invalid ACBS bank payload, terminating API call for deal %s', MOCK_DEAL_ACBS._id);
  });

  it('should call createACBS API function with correct payload', async () => {
    // Arrange
    findOneTfmDeal.mockResolvedValue(MOCK_DEAL_ACBS);

    const bank = {
      id: MOCK_DEAL_ACBS.dealSnapshot.bank.id,
      name: MOCK_DEAL_ACBS.dealSnapshot.bank.name,
      partyUrn: MOCK_DEAL_ACBS.dealSnapshot.bank.partyUrn,
    };

    // Act
    await createACBS(MOCK_DEAL_ACBS._id);

    // Assert
    expect(MOCK_DEAL_ACBS.dealSnapshot).toBeDefined();
    expect(MOCK_DEAL_ACBS.dealSnapshot.facilities[0].facilitySnapshot).toBeDefined();

    expect(createACBSMock).toHaveBeenCalledTimes(1);
    expect(createACBSMock).toHaveBeenCalledWith(MOCK_DEAL_ACBS, bank);
  });
});

describe('updateIssuedFacilityAcbs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update the facility acbs object when successfully issued in ACBS', async () => {
    // Arrange
    const { facilityIdentifier, issuedFacilityMaster, facilityLoan, facilityFee } = mockAcbsFacilityIssueTask.acbsTaskResult.output;

    // Act
    await updateIssuedFacilityAcbs(mockAcbsFacilityIssueTask.acbsTaskResult.output);

    // Assert
    expect(updateFacilityAcbs).toHaveBeenCalledTimes(1);
    expect(updateFacilityAcbs).toHaveBeenCalledWith(facilityIdentifier, {
      facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.ISSUED,
      issuedFacilityMaster,
      facilityLoan,
      facilityFee,
    });
  });
});

describe('updateAmendedFacilityAcbs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update the facility acbs object when successfully amended in ACBS', async () => {
    // Arrange
    const { instanceId } = mockAcbsFacilityIssueTask.acbsTaskResult;
    const { _id } = mockAcbsFacilityIssueTask.acbsTaskResult.input.amendment.facility;
    const { facilityMasterRecord, facilityLoanRecord } = mockAcbsFacilityIssueTask.acbsTaskResult.output;

    const mockAcbsUpdate = {
      [instanceId]: {
        facilityMasterRecord,
        facilityLoanRecord,
      },
    };

    // Act
    await updateAmendedFacilityAcbs(mockAcbsFacilityIssueTask.acbsTaskResult);

    // Assert
    expect(updateFacilityAcbs).toHaveBeenCalledTimes(1);
    expect(updateFacilityAcbs).toHaveBeenCalledWith(_id, mockAcbsUpdate);
  });
});
