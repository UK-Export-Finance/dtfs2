const { createMocks } = require('node-mocks-http');
const { HttpStatusCode } = require('axios');
const { isTfmApimGiftIntegrationEnabled } = require('@ukef/dtfs2-common');
const api = require('../api');
const { sendFacilityAmendment } = require('./amendment.controller');
const { canSendAmendmentsToApimGift } = require('../integrations/apim-gift/can-send-amendments-to-apim-gift');
const { submitFacilityAmendmentsToApimGift } = require('../integrations/apim-gift/submit-facility-amendments-to-apim-gift');
const { APIM_GIFT_INTEGRATION } = require('../mappings/apim-gift-payloads');

jest.mock('../api', () => ({
  getAmendmentById: jest.fn(),
  findOneFacility: jest.fn(),
}));

jest.mock('../integrations/apim-gift/can-send-amendments-to-apim-gift');
jest.mock('../integrations/apim-gift/submit-facility-amendments-to-apim-gift');

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmApimGiftIntegrationEnabled: jest.fn(),
}));

const { AMENDMENT_TYPE } = APIM_GIFT_INTEGRATION;

describe('sendFacilityAmendment', () => {
  const facilityId = '66b1f2f6f4b5a8f3c7d9e011';
  const amendmentId = '66b1f2f6f4b5a8f3c7d9e012';

  const amendment = { amendmentId, facilityId, dealId: 'deal-123' };
  const facility = { _id: facilityId, facilitySnapshot: { ukefFacilityId: '0030537688' } };

  beforeEach(() => {
    jest.clearAllMocks();
    console.info = jest.fn();
    console.error = jest.fn();

    api.getAmendmentById.mockResolvedValue(amendment);
    api.findOneFacility.mockResolvedValue(facility);

    isTfmApimGiftIntegrationEnabled.mockReturnValue(false);
  });

  describe('basic flow', () => {
    it('should fetch amendment and facility with provided IDs', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId, facilityId },
      });

      await sendFacilityAmendment(req, res);

      expect(api.getAmendmentById).toHaveBeenNthCalledWith(1, facilityId, amendmentId);
      expect(api.findOneFacility).toHaveBeenNthCalledWith(1, facilityId);
    });

    it('should log entry message', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId, facilityId },
      });

      await sendFacilityAmendment(req, res);

      expect(console.info).toHaveBeenNthCalledWith(
        1,
        'TFM facility %s sendFacilityAmendment - sending amendment %s to ACBS and/or APIM GIFT',
        facilityId,
        amendmentId,
      );
    });
  });

  describe('error handling', () => {
    it(`should return ${HttpStatusCode.UnprocessableEntity} when amendmentId is missing`, async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { facilityId },
      });

      await sendFacilityAmendment(req, res);

      expect(res._getStatusCode()).toEqual(HttpStatusCode.UnprocessableEntity);
    });

    it(`should return ${HttpStatusCode.UnprocessableEntity} when facilityId is missing`, async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId },
      });

      await sendFacilityAmendment(req, res);

      expect(res._getStatusCode()).toEqual(HttpStatusCode.UnprocessableEntity);
    });

    it(`should return ${HttpStatusCode.BadGateway} when amendment is not found`, async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId, facilityId },
      });

      api.getAmendmentById.mockResolvedValue(null);

      await sendFacilityAmendment(req, res);

      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadGateway);

      expect(console.error).toHaveBeenNthCalledWith(
        1,
        'Unable to send facility amendment %s to ACBS and/or APIM GIFT for facility %s %o',
        amendmentId,
        facilityId,
        expect.any(Error),
      );
    });

    it(`should return ${HttpStatusCode.BadGateway} when facility is not found`, async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId, facilityId },
      });

      api.findOneFacility.mockResolvedValue(null);

      await sendFacilityAmendment(req, res);

      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadGateway);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        'Unable to send facility amendment %s to ACBS and/or APIM GIFT for facility %s %o',
        amendmentId,
        facilityId,
        expect.any(Error),
      );
    });
  });

  describe('APIM GIFT integration', () => {
    it('should not check APIM GIFT when integration is disabled', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId, facilityId },
      });

      isTfmApimGiftIntegrationEnabled.mockReturnValue(false);

      await sendFacilityAmendment(req, res);

      expect(canSendAmendmentsToApimGift).not.toHaveBeenCalled();
    });

    it('should check APIM GIFT when integration is enabled', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId, facilityId },
      });

      isTfmApimGiftIntegrationEnabled.mockReturnValue(true);
      canSendAmendmentsToApimGift.mockReturnValue({
        canSendAmendmentsToApimGift: false,
        amendmentPayloads: [],
      });

      await sendFacilityAmendment(req, res);

      expect(canSendAmendmentsToApimGift).toHaveBeenNthCalledWith(1, amendment);
      expect(console.info).toHaveBeennthCalledWith(1, 'TFM facility %s sendFacilityAmendment - calling canSendAmendmentsToApimGift', facilityId);
    });

    it('should not submit to APIM GIFT when canSendAmendmentsToApimGift returns false', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId, facilityId },
      });

      isTfmApimGiftIntegrationEnabled.mockReturnValue(true);
      canSendAmendmentsToApimGift.mockReturnValue({
        canSendAmendmentsToApimGift: false,
        amendmentPayloads: [],
      });

      await sendFacilityAmendment(req, res);

      expect(submitFacilityAmendmentsToApimGift).not.toHaveBeenCalled();
    });

    it('should submit to APIM GIFT when canSendAmendmentsToApimGift returns true', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId, facilityId },
      });

      const payloads = [
        {
          amendmentType: AMENDMENT_TYPE.REPLACE_EXPIRY_DATE,
          amendmentData: { expiryDate: '2024-04-01' },
        },
      ];

      isTfmApimGiftIntegrationEnabled.mockReturnValue(true);
      canSendAmendmentsToApimGift.mockReturnValue({
        canSendAmendmentsToApimGift: true,
        amendmentPayloads: payloads,
      });
      submitFacilityAmendmentsToApimGift.mockResolvedValue(true);

      await sendFacilityAmendment(req, res);

      expect(submitFacilityAmendmentsToApimGift).toHaveBeenNthCalledWith(1, {
        amendmentPayloads: payloads,
        ukefFacilityId: facility.facilitySnapshot.ukefFacilityId,
      });

      expect(console.info).toHaveBeenNthCalledWith(1, 'TFM facility %s sendFacilityAmendment - calling submitFacilityAmendmentsToApimGift', facilityId);
    });

    it(`should return ${HttpStatusCode.BadGateway} when APIM GIFT submission fails`, async () => {
      const { req, res } = createMocks({
        method: 'POST',
        params: { amendmentId, facilityId },
      });

      isTfmApimGiftIntegrationEnabled.mockReturnValue(true);
      canSendAmendmentsToApimGift.mockReturnValue({
        canSendAmendmentsToApimGift: true,
        amendmentPayloads: [{ amendmentType: AMENDMENT_TYPE.REPLACE_EXPIRY_DATE, amendmentData: { expiryDate: '2024-04-01' } }],
      });
      submitFacilityAmendmentsToApimGift.mockResolvedValue(false);

      await sendFacilityAmendment(req, res);

      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadGateway);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        'Failed to submit facility %s amendment %s to APIM GIFT',
        facility.facilitySnapshot.ukefFacilityId,
        amendmentId,
      );
    });
  });
});
