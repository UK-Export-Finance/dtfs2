const { HttpStatusCode } = require('axios');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { canSubmitToApimGift, submitFacilitiesToApimGift } = require('../integrations/apim-gift');
const { createACBS } = require('./acbs.controller');
const canSubmitToACBS = require('../helpers/can-submit-to-acbs');
const api = require('../api');
const { DEAL_TYPE, SUBMISSION_TYPE } = require('../../constants/deals');
const { updateParty } = require('./party.controller');

jest.mock('@ukef/dtfs2-common/change-stream', () => ({
  generateTfmAuditDetails: jest.fn((userId) => ({ userId })),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  DEAL_SUBMISSION_TYPE: {
    AIN: 'AIN',
  },
}));

jest.mock('../api', () => ({
  updateDeal: jest.fn(),
}));

jest.mock('../integrations/apim-gift', () => ({
  canSubmitToApimGift: jest.fn(),
  submitFacilitiesToApimGift: jest.fn(),
}));

jest.mock('./acbs.controller', () => ({
  createACBS: jest.fn(),
}));

jest.mock('../helpers/can-submit-to-acbs', () => jest.fn());

const mockTfmFacility = {
  facilitySnapshot: {
    ukefFacilityId: '0030113305',
    hasBeenIssued: true,
  },
  tfm: {},
};

const issuedFacilities = [mockTfmFacility];

const mockTfmDeal = {
  _id: '5ce819935e539c343f141ece',
  dealSnapshot: {
    bank: {
      id: '123',
      name: 'Test',
      partyUrn: '123',
    },
    ukefDealId: '0030113304',
    dealType: DEAL_TYPE.GEF,
    submissionType: SUBMISSION_TYPE.AIN,
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

const updateDealMock = api.updateDeal;

describe('updateParty', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    updateDealMock.mockResolvedValue(mockTfmDeal);

    canSubmitToApimGift.mockResolvedValue({
      canSubmitFacilitiesToApimGift: false,
      issuedFacilities: [],
      isBssEwcsDeal: false,
      isGefDeal: true,
    });

    canSubmitToACBS.mockResolvedValue(false);
    createACBS.mockResolvedValue({});
  });

  it('should update party and return 200', async () => {
    // Arrange
    const mockRequest = {
      params: {
        dealId: '5ce819935e539c343f141ece',
      },
      body: mockTfmDeal.tfm.parties,
      user: {
        _id: '5ce819935e539c343f141ece',
      },
    };

    // Act
    await updateParty(mockRequest, mockResponse);

    // Assert
    expect(consoleErrorMock).not.toHaveBeenCalled();

    expect(updateDealMock).toHaveBeenNthCalledWith(1, {
      dealId: mockTfmDeal._id,
      dealUpdate: {
        tfm: {
          parties: mockTfmDeal.tfm.parties,
        },
      },
      auditDetails: generateTfmAuditDetails(mockRequest.user._id),
    });

    expect(canSubmitToApimGift).toHaveBeenCalledWith(mockTfmDeal);
    expect(submitFacilitiesToApimGift).not.toHaveBeenCalled();
    expect(createACBS).not.toHaveBeenCalled();

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(mockResponse.send).toHaveBeenCalledWith({
      updateParty: {
        parties: mockTfmDeal.tfm.parties,
      },
    });
  });

  describe('when APIM/GIFT submission is allowed', () => {
    it('should call submitFacilitiesToApimGift', async () => {
      // Arrange
      const mockRequest = {
        params: {
          dealId: '5ce819935e539c343f141ece',
        },
        body: mockTfmDeal.tfm.parties,
        user: {
          _id: '5ce819935e539c343f141ece',
        },
      };

      canSubmitToApimGift.mockResolvedValue({
        canSubmitFacilitiesToApimGift: true,
        issuedFacilities,
        isBssEwcsDeal: false,
        isGefDeal: true,
      });

      // Act
      await updateParty(mockRequest, mockResponse);

      // Assert
      expect(submitFacilitiesToApimGift).toHaveBeenCalledWith({
        deal: mockTfmDeal,
        facilities: issuedFacilities,
        isBssEwcsDeal: false,
        isGefDeal: true,
      });
    });

    it('should return 500 when submitFacilitiesToApimGift fails', async () => {
      const mockRequest = {
        params: {
          dealId: '5ce819935e539c343f141ece',
        },
        body: mockTfmDeal.tfm.parties,
        user: {
          _id: '5ce819935e539c343f141ece',
        },
      };
      const apimGiftError = new Error('APIM/GIFT failed');

      canSubmitToApimGift.mockResolvedValue({
        canSubmitFacilitiesToApimGift: true,
        issuedFacilities,
        isBssEwcsDeal: false,
        isGefDeal: true,
      });
      submitFacilitiesToApimGift.mockRejectedValueOnce(apimGiftError);

      await updateParty(mockRequest, mockResponse);

      expect(consoleErrorMock).toHaveBeenCalledWith('TFM deal %s updateParty - submitFacilitiesToApimGift failed %o', mockRequest.params.dealId, apimGiftError);
      expect(consoleErrorMock).toHaveBeenCalledWith('Unable to update parties for deal %s %o', mockRequest.params.dealId, apimGiftError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith(apimGiftError);
    });
  });

  describe('when APIM/GIFT submission is not allowed', () => {
    it('should not call submitFacilitiesToApimGift', async () => {
      // Arrange
      const mockRequest = {
        params: {
          dealId: '5ce819935e539c343f141ece',
        },
        body: mockTfmDeal.tfm.parties,
        user: {
          _id: '5ce819935e539c343f141ece',
        },
      };

      canSubmitToApimGift.mockResolvedValue({
        canSubmitFacilitiesToApimGift: false,
        issuedFacilities,
        isBssEwcsDeal: false,
        isGefDeal: true,
      });

      // Act
      await updateParty(mockRequest, mockResponse);

      // Assert
      expect(submitFacilitiesToApimGift).not.toHaveBeenCalled();
    });
  });

  describe('when ACBS submission is allowed', () => {
    it('should return 500 when createACBS fails', async () => {
      const mockRequest = {
        params: {
          dealId: '5ce819935e539c343f141ece',
        },
        body: mockTfmDeal.tfm.parties,
        user: {
          _id: '5ce819935e539c343f141ece',
        },
      };
      const acbsError = new Error('ACBS failed');

      canSubmitToACBS.mockResolvedValue(true);
      createACBS.mockRejectedValueOnce(acbsError);

      await updateParty(mockRequest, mockResponse);

      expect(consoleErrorMock).toHaveBeenCalledWith('TFM deal %s updateParty - createACBS failed %o', mockRequest.params.dealId, acbsError);
      expect(consoleErrorMock).toHaveBeenCalledWith('Unable to update parties for deal %s %o', mockRequest.params.dealId, acbsError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith(acbsError);
    });
  });

  describe('when user session does not exist', () => {
    it('should throw an error', async () => {
      // Arrange
      const mockRequest = {
        params: {},
        body: mockTfmDeal.tfm.parties,
      };

      // Mock `res.status().send()` to return `res` itself
      mockResponse.status.mockImplementation(() => mockResponse);

      // Act
      await updateParty(mockRequest, mockResponse);

      // Assert
      expect(consoleErrorMock).toHaveBeenNthCalledWith(
        1,
        'Unable to update parties for deal %s %o',
        undefined,
        new Error("Cannot read properties of undefined (reading '_id')"),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith(new Error("Cannot read properties of undefined (reading '_id')"));
    });
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
      body: mockTfmDeal.tfm.parties,
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
    const apiError = new Error('Invalid deal object supplied');

    updateDealMock.mockRejectedValueOnce(apiError);

    // Mock `res.status().send()` to return `res` itself
    mockResponse.status.mockImplementation(() => mockResponse);

    // Act
    await updateParty(mockRequest, mockResponse);

    // Assert
    expect(consoleErrorMock).toHaveBeenNthCalledWith(1, 'Unable to update parties for deal %s %o', mockRequest.params.dealId, apiError);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    expect(mockResponse.send).toHaveBeenCalledWith(apiError);
  });
});
