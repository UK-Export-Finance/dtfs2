const { HttpStatusCode } = require('axios');
const { canSendToApimGift, sendFacilitiesToApimGift } = require('../integrations/apim-gift');
const { sendFacilitiesToApimGiftTemp } = require('./apim-gift.temp.controller');

jest.mock('../integrations/apim-gift', () => ({
  canSendToApimGift: jest.fn(),
  sendFacilitiesToApimGift: jest.fn(),
}));

describe('sendFacilitiesToApimGiftTemp', () => {
  const dealId = '66b1f2f6f4b5a8f3c7d9e013';
  const mockDeal = { _id: dealId, dealSnapshot: {}, tfm: {} };
  const mockFacility = { _id: 'facility-1' };

  const response = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

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
    expect(response.send).toHaveBeenCalledWith({
      canSendFacilitiesToApimGift: false,
      sentToApimGift: false,
      facilitiesSent: 0,
    });
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
