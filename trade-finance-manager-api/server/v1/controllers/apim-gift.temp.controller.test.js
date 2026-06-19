const { HttpStatusCode } = require('axios');
const { canSendToApimGift, sendFacilitiesToApimGift } = require('../integrations/apim-gift');
const { mapFacilitiesToSendToGift } = require('../integrations/apim-gift/map-facilities-to-send-to-gift');
const { getReferenceData } = require('../integrations/apim-gift/send-facilities-to-apim-gift/get-reference-data');
const { APIM_GIFT_PAYLOADS } = require('../mappings/apim-gift-payloads');
const api = require('../api');

jest.mock('../integrations/apim-gift', () => ({
  canSendToApimGift: jest.fn(),
  sendFacilitiesToApimGift: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  DEAL_SUBMISSION_TYPE: {
    AIN: 'Automatic Inclusion Notice',
    MIN: 'Manual Inclusion Notice',
  },
  DEAL_TYPE: {
    BSS_EWCS: 'BSS/EWCS',
    GEF: 'GEF',
  },
  isTfmApimGiftIntegrationEnabled: jest.fn(() => true),
}));

jest.mock('../integrations/apim-gift/map-facilities-to-send-to-gift', () => ({
  mapFacilitiesToSendToGift: jest.fn(),
}));

jest.mock('../integrations/apim-gift/send-facilities-to-apim-gift/get-reference-data', () => ({
  getReferenceData: jest.fn(),
}));

jest.mock('../mappings/apim-gift-payloads', () => ({
  APIM_GIFT_PAYLOADS: {
    createFacility: jest.fn(),
  },
}));

jest.mock('../api', () => ({
  findFacilitiesByDealId: jest.fn(),
  findGiftFacilitiesByIds: jest.fn(),
}));

const { sendFacilitiesToApimGiftTemp } = require('./apim-gift.temp.controller');

describe('sendFacilitiesToApimGiftTemp', () => {
  const dealId = '66b1f2f6f4b5a8f3c7d9e013';
  const mockFacility = { _id: 'facility-1' };
  const mockFacilityWithSnapshot = {
    ...mockFacility,
    facilitySnapshot: {
      hasBeenIssued: true,
      ukefFacilityId: '41743233',
    },
  };
  const mockFacilityPayload = { overview: { facilityId: '41743233' } };
  const mockDeal = {
    _id: dealId,
    dealSnapshot: {
      dealType: 'BSS/EWCS',
      submissionType: 'Manual Inclusion Notice',
    },
    tfm: {
      exporterCreditRating: 'A',
      parties: {
        buyer: {
          partyUrn: '123456789',
        },
      },
    },
  };

  const response = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    api.findFacilitiesByDealId.mockResolvedValue([mockFacilityWithSnapshot]);
    api.findGiftFacilitiesByIds.mockResolvedValue({ facilities: [] });
    mapFacilitiesToSendToGift.mockReturnValue({ facilitiesToSendToApimGift: [mockFacilityWithSnapshot] });
    getReferenceData.mockResolvedValue({
      creditRiskRatings: ['A'],
      facilityCategories: [],
    });
    APIM_GIFT_PAYLOADS.createFacility.mockResolvedValue(mockFacilityPayload);

    canSendToApimGift.mockResolvedValue({
      canSendFacilitiesToApimGift: true,
      issuedFacilities: [mockFacility],
      isBssEwcsDeal: false,
      isGefDeal: true,
    });
    sendFacilitiesToApimGift.mockResolvedValue([{ _id: 'gift-facility-1' }]);
  });

  it('calls canSendToApimGift and sendFacilitiesToApimGift when eligible', async () => {
    const request = {
      body: { deal: mockDeal, facility: mockFacility, newPartyUrnCreated: true },
    };

    await sendFacilitiesToApimGiftTemp(request, response);

    expect(canSendToApimGift).toHaveBeenNthCalledWith(1, mockDeal);
    expect(sendFacilitiesToApimGift).toHaveBeenNthCalledWith(1, {
      deal: mockDeal,
      facilities: [mockFacility],
      isBssEwcsDeal: false,
      isGefDeal: true,
      newPartyUrnCreated: true,
    });
    expect(response.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(response.send).toHaveBeenCalledWith(
      expect.objectContaining({
        canSendFacilitiesToApimGift: true,
        sentToApimGift: true,
        facilitiesSent: 1,
        facilityPayload: mockFacilityPayload,
      }),
    );
  });

  it('does not call sendFacilitiesToApimGift when not eligible', async () => {
    const request = {
      body: { deal: mockDeal, facility: mockFacility },
    };

    canSendToApimGift.mockResolvedValue({
      canSendFacilitiesToApimGift: false,
      issuedFacilities: [],
      isBssEwcsDeal: false,
      isGefDeal: true,
    });

    await sendFacilitiesToApimGiftTemp(request, response);

    expect(sendFacilitiesToApimGift).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(response.send).toHaveBeenCalledWith(
      expect.objectContaining({
        canSendFacilitiesToApimGift: false,
        sentToApimGift: false,
        facilitiesSent: 0,
        facilityPayload: null,
        hasExporterCreditRating: true,
        hasTfmBuyerPartyUrn: true,
        failureReasons: expect.any(Array),
      }),
    );
  });

  it(`returns ${HttpStatusCode.BadRequest} when deal or facility is missing`, async () => {
    const request = {
      body: { deal: mockDeal },
    };

    await sendFacilitiesToApimGiftTemp(request, response);

    expect(canSendToApimGift).not.toHaveBeenCalled();
    expect(sendFacilitiesToApimGift).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(response.send).toHaveBeenCalledWith({ data: 'Request body must include deal and facility' });
  });
});
