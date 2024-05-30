const canSubmitToACBS = require('./can-submit-to-acbs');
const api = require('../api');
const CONSTANTS = require('../../constants');

const mockTfmFacility = {
  facilitySnapshot: {
    ukefFacilityId: '0030113305',
    hasBeenIssued: true,
  },
  tfm: {},
};

const mockTfmDeal = {
  _id: '5ce819935e539c343f141ece',
  dealSnapshot: {
    bank: {
      id: '123',
      name: 'Test',
      partyUrn: '123',
    },
    ukefDealId: '0030113304',
    dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
    submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
    facilities: [mockTfmFacility],
  },
  tfm: {
    parties: {
      agent: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
      exporter: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
      indemnifier: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
    },
  },
};

const consoleInfoMock = jest.spyOn(console, 'info');
consoleInfoMock.mockImplementation();

const consoleErrorMock = jest.spyOn(console, 'error');
consoleErrorMock.mockImplementation();

const findOneDealMock = jest.spyOn(api, 'findOneDeal');
findOneDealMock.mockResolvedValue(mockTfmDeal);

const findOneFacilityMock = jest.spyOn(api, 'findOneFacility');
findOneFacilityMock.mockResolvedValue(mockTfmFacility);
const findFacilitiesByDealIdMock = jest.spyOn(api, 'findFacilitiesByDealId');
findFacilitiesByDealIdMock.mockResolvedValue([mockTfmFacility]);

describe('canSubmiToACBS', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return true', async () => {
    // Act
    const result = await canSubmitToACBS(mockTfmDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(consoleInfoMock).toHaveBeenCalledTimes(2);
    expect(consoleInfoMock).toHaveBeenCalledWith('⚡ Validating ACBS deal %s prerequisites.', mockTfmDeal._id);
    expect(consoleInfoMock).toHaveBeenCalledWith('✅ Deal %s is eligible for submission to ACBS.', mockTfmDeal._id);

    expect(result).toEqual(true);
  });

  const invalidDeals = [null, undefined, {}, { ukefDealId: '123' }, [], 123, '123', '!$%'];

  it.each(invalidDeals)('should log an error and return false if the deal object is invalid', async (deal) => {
    // Act
    const result = await canSubmitToACBS(deal);

    // Assert
    expect(consoleInfoMock).toHaveBeenCalledTimes(0);

    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith('Unable to submit deal to ACBS %o', new Error('Invalid deal object supplied'));

    expect(result).toEqual(false);
  });

  const invalidSubmissionTypeDeals = [CONSTANTS.DEALS.SUBMISSION_TYPE.MIA, '', undefined, null, {}, [], 123, '123', '!£$'];

  it.each(invalidSubmissionTypeDeals)('should return false if submission type is not valid', async (submissionType) => {
    // Arrange
    const mockDeal = {
      ...mockTfmDeal,
      dealSnapshot: {
        ...mockTfmDeal.dealSnapshot,
        submissionType,
      },
    };

    // Act
    const result = await canSubmitToACBS(mockDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(consoleInfoMock).toHaveBeenCalledWith('⚡ Validating ACBS deal %s prerequisites.', mockDeal._id);

    expect(result).toEqual(false);
  });

  it('should return false if the deal has been submitted to ACBS', async () => {
    // Arrange
    const mockDeal = {
      ...mockTfmDeal,
      tfm: {
        ...mockTfmDeal.tfm,
        acbs: {},
      },
    };

    // Act
    const result = await canSubmitToACBS(mockDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(consoleInfoMock).toHaveBeenCalledWith('⚡ Validating ACBS deal %s prerequisites.', mockDeal._id);

    expect(result).toEqual(false);
  });

  const invalidIds = [CONSTANTS.DEALS.UKEF_ID.PENDING, CONSTANTS.DEALS.UKEF_ID.TEST, '', '0000000000', '123', 'ABC', '!"£', [], {}];

  it.each(invalidIds)('should return false if the deal has invalid IDs', async (dealId) => {
    // Arrange
    const mockDeal = {
      ...mockTfmDeal,
      dealSnapshot: {
        ...mockTfmDeal.dealSnapshot,
        ukefDealId: dealId,
      },
    };

    // Act
    const result = await canSubmitToACBS(mockDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(consoleInfoMock).toHaveBeenCalledWith('⚡ Validating ACBS deal %s prerequisites.', mockDeal._id);

    expect(result).toEqual(false);
  });

  it.each(invalidIds)('should return false if the deal has invalid IDs', async (facilityId) => {
    // Arrange
    const mockDeal = {
      ...mockTfmDeal,
      dealSnapshot: {
        ...mockTfmDeal.dealSnapshot,
        facilities: [
          {
            ...mockTfmFacility,
            facilitySnapshot: {
              ...mockTfmFacility.facilitySnapshot,
              ukefFacilityId: facilityId,
            },
          },
        ],
      },
    };

    mockDeal.dealSnapshot.facilities[0].facilitySnapshot.ukefFacilityId = facilityId;

    // Act
    const result = await canSubmitToACBS(mockDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(consoleInfoMock).toHaveBeenCalledWith('⚡ Validating ACBS deal %s prerequisites.', mockDeal._id);

    expect(result).toEqual(false);
  });

  const invalidPartiesUrn = [
    {
      agent: {
        partyUrn: '',
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
      exporter: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
      indemnifier: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
    },
    {
      agent: {
        partyUrn: '',
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      exporter: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      indemnifier: {
        partyUrn: '',
        partyUrnRequired: false,
      },
    },
    {
      agent: {
        partyUrn: null,
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      exporter: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      indemnifier: {
        partyUrn: '',
        partyUrnRequired: false,
      },
    },
    {
      agent: {
        partyUrn: undefined,
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      exporter: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      indemnifier: {
        partyUrn: '',
        partyUrnRequired: false,
      },
    },
    {
      agent: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      exporter: {
        partyUrn: '',
        partyUrnRequired: true,
      },
      indemnifier: {
        partyUrn: '',
        partyUrnRequired: false,
      },
    },
    {
      agent: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '',
        partyUrnRequired: true,
      },
      exporter: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      indemnifier: {
        partyUrn: '',
        partyUrnRequired: false,
      },
    },
    {
      agent: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      exporter: {
        partyUrn: '',
        partyUrnRequired: true,
      },
      indemnifier: {
        partyUrn: '',
        partyUrnRequired: false,
      },
    },
    {
      agent: {
        partyUrn: '123',
        partyUrnRequired: true,
      },
      buyer: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      exporter: {
        partyUrn: '',
        partyUrnRequired: false,
      },
      indemnifier: {
        partyUrn: '',
        partyUrnRequired: true,
      },
    },
  ];

  it.each(invalidPartiesUrn)('should return false if the required party does not have a URN', async (parties) => {
    // Arrange
    const mockDeal = {
      ...mockTfmDeal,
      tfm: {
        ...mockTfmDeal.tfm,
        parties,
      },
    };

    // Act
    const result = await canSubmitToACBS(mockDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(consoleInfoMock).toHaveBeenCalledWith('⚡ Validating ACBS deal %s prerequisites.', mockDeal._id);

    expect(result).toEqual(false);
  });

  const invalidFacilityPartiesUrn = [
    {
      ...mockTfmFacility.facilitySnapshot,
      bondIssuer: '123',
    },
    {
      ...mockTfmFacility.facilitySnapshot,
      bondBeneficiary: '123',
    },
  ];

  it.each(invalidFacilityPartiesUrn)('should return false if the required facility party does not have a URN', async (facilitySnapshot) => {
    // Arrange
    const mockDeal = {
      ...mockTfmDeal,
      dealSnapshot: {
        ...mockTfmDeal.dealSnapshot,
        facilities: [
          {
            ...mockTfmFacility,
            facilitySnapshot,
          },
        ],
      },
    };

    mockDeal.dealSnapshot.facilities[0].facilitySnapshot = facilitySnapshot;

    // Act
    const result = await canSubmitToACBS(mockDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(consoleInfoMock).toHaveBeenCalledWith('⚡ Validating ACBS deal %s prerequisites.', mockDeal._id);

    expect(result).toEqual(false);
  });

  const invalidFacilityTfmPartiesUrn = [
    {
      bondIssuerPartyUrn: '',
    },
    {
      bondBeneficiaryPartyUrn: '',
    },
    {
      bondIssuerPartyUrn: '123',
    },
    {
      bondBeneficiaryPartyUrn: '123',
    },
    {
      bondIssuerPartyUrn: null,
      bondBeneficiaryPartyUrn: '123',
    },
  ];

  it.each(invalidFacilityTfmPartiesUrn)('should return false if the required facility party does not have a URN', async (tfm) => {
    // Arrange
    const mockDeal = {
      ...mockTfmDeal,
      dealSnapshot: {
        ...mockTfmDeal.dealSnapshot,
        facilities: [
          {
            ...mockTfmFacility,
            tfm,
          },
        ],
      },
    };

    // Act
    const result = await canSubmitToACBS(mockDeal);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(consoleInfoMock).toHaveBeenCalledTimes(1);
    expect(consoleInfoMock).toHaveBeenCalledWith('⚡ Validating ACBS deal %s prerequisites.', mockDeal._id);

    expect(result).toEqual(false);
  });
});
