const { HttpStatusCode } = require('axios');
const { TFM_AMENDMENT_STATUS, canSendToAcbs, isTfmApimGiftIntegrationEnabled } = require('@ukef/dtfs2-common');

jest.mock('passport', () => ({
  use: jest.fn(),
  initialize: jest.fn(() => (req, res, next) => next()),
  authenticate: jest.fn(() => (req, res, next) => {
    req.user = { _id: '6051d94564494924d38ce67c' };
    next();
  }),
}));

const app = require('../../../server/createApp');
const { createApi } = require('../../api');
const api = require('../../../server/v1/api');
const { mockFindUserById } = require('../../../server/v1/__mocks__/common-api-mocks');
const { submitFacilityAmendmentsToApimGift } = require('../../../server/v1/integrations/apim-gift/submit-facility-amendments-to-apim-gift');
const { amendIssuedFacility } = require('../../../server/v1/controllers/amend-issued-facility');

const { as } = createApi(app);

jest.mock('../../../server/v1/api');

jest.mock('../../../server/v1/integrations/apim-gift/submit-facility-amendments-to-apim-gift', () => ({
  submitFacilityAmendmentsToApimGift: jest.fn(),
}));

jest.mock('../../../server/v1/controllers/amend-issued-facility', () => ({
  amendIssuedFacility: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  canSendToAcbs: jest.fn(() => false),
  isTfmApimGiftIntegrationEnabled: jest.fn(() => false),
}));

describe('PUT /v1/facilities/:facilityId/amendments/:amendmentId - APIM GIFT integration', () => {
  const facilityId = '66b1f2f6f4b5a8f3c7d9e011';
  const amendmentId = '66b1f2f6f4b5a8f3c7d9e012';
  const dealId = '66b1f2f6f4b5a8f3c7d9e013';
  const ukefFacilityId = '0030537688';
  const url = `/v1/facilities/${facilityId}/amendments/${amendmentId}`;

  const amendment = {
    amendmentId,
    facilityId,
    dealId,
    status: TFM_AMENDMENT_STATUS.COMPLETED,
    changeFacilityValue: false,
    changeCoverEndDate: true,
    tfm: {
      coverEndDate: 1711929600000,
    },
  };

  const tfmDeal = {
    tfm: {},
    dealSnapshot: {
      dealType: 'BSS',
      submissionType: 'AIN',
      submissionDate: '2024-01-01T00:00:00.000Z',
      exporter: {
        companyName: 'Mock Exporter Ltd',
      },
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockFindUserById();

    api.getAmendmentById = jest.fn().mockResolvedValue(amendment);
    api.updateFacilityAmendment = jest.fn().mockResolvedValue(amendment);
    api.findOneFacility = jest.fn().mockResolvedValue({
      _id: facilityId,
      facilitySnapshot: {
        ukefFacilityId,
      },
      tfm: {},
    });
    api.findOneDeal = jest.fn().mockResolvedValue(tfmDeal);
    api.findPortalUserById = jest.fn().mockResolvedValue({});

    canSendToAcbs.mockReturnValue(false);
    isTfmApimGiftIntegrationEnabled.mockReturnValue(false);
    submitFacilityAmendmentsToApimGift.mockResolvedValue([HttpStatusCode.Accepted]);
  });

  describe('when APIM/GIFT submission is allowed', () => {
    it('calls APIM GIFT', async () => {
      // Arrange
      isTfmApimGiftIntegrationEnabled.mockReturnValue(true);

      // Act
      const { status } = await as()
        .put({
          status: TFM_AMENDMENT_STATUS.COMPLETED,
        })
        .to(url);

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);
      expect(submitFacilityAmendmentsToApimGift).toHaveBeenNthCalledWith(1, {
        amendment,
        ukefFacilityId,
      });
      expect(amendIssuedFacility).toHaveBeenCalledTimes(1);
    });
  });

  describe('when APIM/GIFT submission is not allowed', () => {
    it('does not call APIM GIFT', async () => {
      // Arrange
      isTfmApimGiftIntegrationEnabled.mockReturnValue(false);

      // Act
      const { status } = await as()
        .put({
          status: TFM_AMENDMENT_STATUS.COMPLETED,
        })
        .to(url);

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);
      expect(submitFacilityAmendmentsToApimGift).not.toHaveBeenCalled();
      expect(amendIssuedFacility).toHaveBeenCalledTimes(1);
    });
  });

  describe('when APIM GIFT submission fails', () => {
    it(`returns ${HttpStatusCode.BadRequest}`, async () => {
      // Arrange
      isTfmApimGiftIntegrationEnabled.mockReturnValue(true);
      submitFacilityAmendmentsToApimGift.mockResolvedValue(false);

      // Act
      const { status, body } = await as()
        .put({
          status: TFM_AMENDMENT_STATUS.COMPLETED,
        })
        .to(url);

      // Assert
      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body).toEqual({ data: 'Unable to update amendment' });
      expect(canSendToAcbs).not.toHaveBeenCalled();
    });
  });
});
