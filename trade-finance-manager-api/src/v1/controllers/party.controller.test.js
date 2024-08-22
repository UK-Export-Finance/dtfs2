const { HttpStatusCode } = require('axios');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { updateParty } = require('./party.controller');
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

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
};

const consoleErrorMock = jest.spyOn(console, 'error');
consoleErrorMock.mockImplementation();

const findOneDealMock = jest.spyOn(api, 'findOneDeal');
findOneDealMock.mockResolvedValue(mockTfmDeal);

const findOneFacilityMock = jest.spyOn(api, 'findOneFacility');
findOneFacilityMock.mockResolvedValue(mockTfmFacility);
const findFacilitiesByDealIdMock = jest.spyOn(api, 'findFacilitiesByDealId');
findFacilitiesByDealIdMock.mockResolvedValue([mockTfmFacility]);

const updateDealMock = jest.spyOn(api, 'updateDeal');
updateDealMock.mockResolvedValue(mockTfmDeal);

const createACBSMock = jest.spyOn(api, 'createACBS');
createACBSMock.mockResolvedValue({});

describe('updateParty', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should update party, call ACBS and return 200', async () => {
    // Arrange
    const mockRequest = {
      params: {
        dealId: '5ce819935e539c343f141ece',
      },
      body: {
        ...mockTfmDeal.tfm.parties,
      },
      user: {
        _id: '5ce819935e539c343f141ece',
      },
    };

    // Act
    await updateParty(mockRequest, mockResponse);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(findOneDealMock).toHaveBeenCalledTimes(2);
    expect(findOneDealMock).toHaveBeenCalledWith(mockTfmDeal._id);

    expect(findFacilitiesByDealIdMock).toHaveBeenCalledTimes(2);

    expect(updateDealMock).toHaveBeenCalledTimes(1);
    expect(updateDealMock).toHaveBeenCalledWith({
      dealId: mockTfmDeal._id,
      dealUpdate: {
        tfm: {
          parties: mockTfmDeal.tfm.parties,
        },
      },
      auditDetails: generateTfmAuditDetails(mockRequest.user._id),
    });

    expect(createACBSMock).toHaveBeenCalledTimes(1);
    expect(createACBSMock).toHaveBeenCalledWith(mockTfmDeal, mockTfmDeal.dealSnapshot.bank);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(mockResponse.send).toHaveBeenCalledWith({
      updateParty: {
        parties: mockTfmDeal.tfm.parties,
      },
    });
  });

  it('should throw an error when user session does not exist', async () => {
    // Arrange
    const mockRequest = {
      params: {},
      body: {
        ...mockTfmDeal.tfm.parties,
      },
    };

    // Mock `res.status().send()` to return `res` itself
    mockResponse.status.mockImplementation(() => mockResponse);

    // Act
    await updateParty(mockRequest, mockResponse);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      'Unable to update parties for deal %s %o',
      undefined,
      new Error("Cannot read properties of undefined (reading '_id')"),
    );

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    expect(mockResponse.send).toHaveBeenCalledWith(new Error("Cannot read properties of undefined (reading '_id')"));
  });

  const requests = [
    {
      params: {},
      body: {},
      user: {},
    },
    {
      params: {},
      body: {},
      user: {
        _id: '5ce819935e539c343f141ece',
      },
    },
    {
      params: {},
      body: {
        ...mockTfmDeal.tfm.parties,
      },
      user: {
        _id: '5ce819935e539c343f141ece',
      },
    },
    {
      params: {
        dealId: '5ce819935e539c343f141ece',
      },
      body: {},
      user: {
        _id: '5ce819935e539c343f141ece',
      },
    },
  ];

  it.each(requests)('should throw an error when request is invalid', async (request) => {
    // Arrange
    const mockRequest = request;

    // Mock `res.status().send()` to return `res` itself
    mockResponse.status.mockImplementation(() => mockResponse);

    // Act
    await updateParty(mockRequest, mockResponse);

    // Assert
    expect(consoleErrorMock).toHaveBeenCalledTimes(2);
    expect(consoleErrorMock).toHaveBeenCalledWith('Unable to submit deal to ACBS %o', new Error('Invalid deal object supplied'));
    expect(consoleErrorMock).toHaveBeenCalledWith(
      'Unable to update parties for deal %s %o',
      mockRequest.params.dealId,
      new Error("Cannot read properties of undefined (reading 'tfm')"),
    );

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    expect(mockResponse.send).toHaveBeenCalledWith(new Error("Cannot read properties of undefined (reading 'tfm')"));
  });
});
