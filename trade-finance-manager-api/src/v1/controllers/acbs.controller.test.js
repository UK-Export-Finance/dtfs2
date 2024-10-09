const { DURABLE_FUNCTIONS_LOG } = require('@ukef/dtfs2-common');
const { issueAcbsFacilities, addToACBSLog } = require('./acbs.controller');
const api = require('../api');
const { mongoDbClient: db } = require('../../drivers/db-client');
const CONSTANTS = require('../../constants');
const { createACBS } = require('./acbs.controller');
const MOCK_DEAL_ACBS = require('../__mocks__/mock-deal-acbs');
const { findOneTfmDeal } = require('./deal.controller');

const consoleErrorMock = jest.spyOn(console, 'error');
consoleErrorMock.mockImplementation();

const consoleInfoMock = jest.spyOn(console, 'info');
consoleInfoMock.mockImplementation();

const insertOneMock = jest.fn().mockResolvedValue(true);
const getCollectionMock = jest.spyOn(db, 'getCollection');
getCollectionMock.mockResolvedValue({ insertOne: insertOneMock });

const createACBSAPIMock = jest.fn().mockResolvedValue(123);
const createACBSMock = jest.spyOn(api, 'createACBS');
createACBSMock.mockResolvedValue(createACBSAPIMock);

/**
 * Mock `deal.controller` imperative functions to
 * expedite unit test execution and keep it in function
 * scope.
 */
jest.mock('./deal.controller', () => ({
  findOneTfmDeal: jest.fn(),
}));

const mockACBSTaskLink = {
  id: '5ce819935e539c343f141ece',
  statusQueryGetUri: 'acbs',
  sendEventPostUri: 'acbs',
  terminatePostUri: 'acbs',
  rewindPostUri: 'acbs',
  purgeHistoryDeleteUri: 'acbs',
};

const updateACBSFacilityMock = jest.spyOn(api, 'updateACBSfacility');
updateACBSFacilityMock.mockResolvedValue(mockACBSTaskLink);

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
      acbsTaskLinks: mockACBSTaskLink,
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
      instanceId: mockACBSTaskLink.id,
      acbsTaskLinks: mockACBSTaskLink,
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

  it('should call updateACBSfacility', async () => {
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
      instanceId: mockACBSTaskLink.id,
      acbsTaskLinks: mockACBSTaskLink,
      submittedDate: expect.any(String),
      auditRecord: expect.any(Object),
    });

    expect(result).toEqual([true]);
  });

  it('should not call updateACBSfacility if acbs property does not exist', async () => {
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

  it('should not call updateACBSfacility if the facility is not issued in Portal', async () => {
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

  it('should not call updateACBSfacility if the facility is not created in ACBS', async () => {
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

  it('should not call updateACBSfacility if the facility is issued in ACBS', async () => {
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

  it('should not call updateACBSfacility if the facility is risk expired in ACBS', async () => {
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
