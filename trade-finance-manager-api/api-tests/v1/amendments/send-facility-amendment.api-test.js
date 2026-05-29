const { HttpStatusCode } = require('axios');
const { canSendToAcbs, DEAL_TYPE, DEAL_SUBMISSION_TYPE } = require('@ukef/dtfs2-common');
const app = require('../../../server/createApp');
const { createApi } = require('../../api');
const api = require('../../../server/v1/api');
const acbsController = require('../../../server/v1/controllers/acbs.controller');
const { internalAmendmentEmail } = require('../../../server/v1/helpers/amendment.helpers');
const { submitFacilityAmendmentsToApimGift } = require('../../../server/v1/integrations/apim-gift/submit-facility-amendments-to-apim-gift');

const { as } = createApi(app);

jest.mock('../../../server/v1/controllers/acbs.controller', () => ({
  amendAcbsFacility: jest.fn(),
}));

jest.mock('../../../server/v1/helpers/amendment.helpers', () => ({
  ...jest.requireActual('../../../server/v1/helpers/amendment.helpers'),
  internalAmendmentEmail: jest.fn(),
}));

jest.mock('../../../server/v1/integrations/apim-gift/submit-facility-amendment-to-apim-gift', () => ({
  submitFacilityAmendmentsToApimGift: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  canSendToAcbs: jest.fn(),
}));

describe('POST /v1/amendment/facility/:facilityId/amendment/:amendmentId', () => {
  const facilityId = '66b1f2f6f4b5a8f3c7d9e011';
  const amendmentId = '66b1f2f6f4b5a8f3c7d9e012';
  const url = `/v1/amendment/facility/${facilityId}/amendment/${amendmentId}`;

  const mockDealId = '66b1f2f6f4b5a8f3c7d9e013';
  const mockUkefFacilityId = '0030537688';

  const amendment = {
    amendmentId,
    dealId: mockDealId,
    changeFacilityValue: false,
  };

  const facility = {
    _id: facilityId,
    facilitySnapshot: {
      ukefFacilityId: mockUkefFacilityId,
    },
  };

  const tfmDeal = {
    tfm: {},
    dealSnapshot: {
      dealType: DEAL_TYPE.BSS,
      submissionType: DEAL_SUBMISSION_TYPE.AIN,
      submissionDate: '2024-01-01T00:00:00.000Z',
      exporter: {
        companyName: 'Mock Exporter Ltd',
      },
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();

    api.getAmendmentById = jest.fn().mockResolvedValue(amendment);
    api.findOneFacility = jest.fn().mockResolvedValue(facility);
    api.findOneDeal = jest.fn().mockResolvedValue(tfmDeal);

    submitFacilityAmendmentsToApimGift.mockResolvedValue({ ok: true });
    canSendToAcbs.mockReturnValue(true);
  });

  describe('when the amendment is ACBS-eligible', () => {
    it('should send amendment to APIM GIFT amend endpoint and ACBS', async () => {
      // Act
      const { status } = await as().post({}).to(url);

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);

      expect(submitFacilityAmendmentsToApimGift).toHaveBeenNthCalledWith(1, {
        amendment,
        ukefFacilityId: mockUkefFacilityId,
      });

      expect(canSendToAcbs).toHaveBeenNthCalledWith(1, { amendment });
      expect(internalAmendmentEmail).toHaveBeenNthCalledWith(1, mockUkefFacilityId);
      expect(acbsController.amendAcbsFacility).toHaveBeenNthCalledWith(1, amendment, facility, {
        dealSnapshot: {
          dealType: tfmDeal.dealSnapshot.dealType,
          submissionType: tfmDeal.dealSnapshot.submissionType,
          submissionDate: tfmDeal.dealSnapshot.submissionDate,
        },
        exporter: {
          companyName: tfmDeal.dealSnapshot.exporter.companyName,
        },
      });
    });
  });

  describe('when the amendment is not ACBS-eligible', () => {
    it('should send amendment to APIM GIFT amend endpoint and not call ACBS', async () => {
      // Arrange
      canSendToAcbs.mockReturnValue(false);

      // Act
      const { status } = await as().post({}).to(url);

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);

      expect(submitFacilityAmendmentsToApimGift).toHaveBeenNthCalledWith(1, {
        amendment,
        ukefFacilityId: mockUkefFacilityId,
      });

      expect(canSendToAcbs).toHaveBeenNthCalledWith(1, { amendment });
      expect(internalAmendmentEmail).not.toHaveBeenCalled();
      expect(acbsController.amendAcbsFacility).not.toHaveBeenCalled();
    });
  });

  describe('when APIM GIFT submission throws', () => {
    it(`should return ${HttpStatusCode.BadGateway}`, async () => {
      // Arrange
      submitFacilityAmendmentsToApimGift.mockRejectedValue(new Error('upstream failed'));

      // Act
      const { status, body } = await as().post({}).to(url);

      // Assert
      expect(status).toEqual(HttpStatusCode.BadGateway);
      expect(body).toEqual({ data: 'Unable to send facility amendment to ACBS and APIM GIFT' });
      expect(acbsController.amendAcbsFacility).not.toHaveBeenCalled();
    });
  });
});
