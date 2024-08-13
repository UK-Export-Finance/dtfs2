const { CURRENCY, AMENDMENT_STATUS, isTfmFacilityEndDateFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const amendmentController = require('../../../src/v1/controllers/amendment.controller');
const externalApis = require('../../../src/v1/api');
const MOCK_GEF_AIN_DEAL = require('../../../src/v1/__mocks__/mock-TFM-deal-AIN-submitted');

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('update amendment-tfm on amendment completion', () => {
  const unixTime = 1658403289;
  const isoString = '2024-02-14T00:00:00.000+00:00';

  const mockAmendment = {
    dealId: '123',
    facilityId: '321',
    amendmentId: '111',
    status: AMENDMENT_STATUS.COMPLETED,
    effectiveDate: unixTime,
  };

  const mockDeal = {
    _id: '123',
    tfm: {
      lastUpdated: 1627976394000,
    },
  };

  const updateDealSpy = jest.fn().mockResolvedValue(mockDeal);

  const valueChange = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '111',
  };

  const dateChange = {
    coverEndDate: unixTime,
  };

  const facilityEndDateChange = {
    facilityEndDate: isoString,
  };

  const mockFacility = {
    facilitySnapshot: { ...MOCK_GEF_AIN_DEAL.dealSnapshot.facilities[0] },
  };

  beforeEach(() => {
    updateDealSpy.mockClear();
    externalApis.getAmendmentById = jest.fn().mockResolvedValue(mockAmendment);
    externalApis.getLatestCompletedAmendmentValue = jest.fn().mockResolvedValue(valueChange);
    externalApis.getLatestCompletedAmendmentDate = jest.fn().mockResolvedValue(dateChange);
    externalApis.getLatestCompletedAmendmentFacilityEndDate = jest.fn().mockResolvedValue(facilityEndDateChange);

    externalApis.updateFacilityAmendment = jest.fn().mockResolvedValue(mockAmendment);
    externalApis.findOneDeal = jest.fn().mockResolvedValue(MOCK_GEF_AIN_DEAL);
    externalApis.findOneFacility = jest.fn().mockResolvedValue(mockFacility);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createAmendmentTFMObject', () => {
    describe('when TFM Facility end date feature flag disabled', () => {
      beforeEach(() => {
        jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
      });

      it('should not create tfm object when no getLatestCompletedAmendmentValue or getLatestCompletedAmendmentDate', async () => {
        externalApis.getLatestCompletedAmendmentValue = jest.fn().mockResolvedValue({});
        externalApis.getLatestCompletedAmendmentDate = jest.fn().mockResolvedValue({});
        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        expect(result).toEqual({});
      });

      it('should create tfm object when getLatestCompletedAmendmentValue and getLatestCompletedAmendmentDate', async () => {
        externalApis.getFacilityExposurePeriod = jest.fn().mockResolvedValue({ exposurePeriodInMonths: 5 });

        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        const expected = {
          amendmentExposurePeriodInMonths: 5,
          coverEndDate: unixTime,
          exposure: {
            exposure: '4,000.00',
            timestamp: expect.any(Number),
            ukefExposureValue: 4000,
          },
          value: {
            currency: CURRENCY.GBP,
            value: 5000,
          },
        };

        expect(result).toEqual(expected);
      });

      it('should create tfm object when getLatestCompletedAmendmentValue only', async () => {
        externalApis.getLatestCompletedAmendmentDate = jest.fn().mockResolvedValue({});

        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        const expected = {
          exposure: {
            exposure: '4,000.00',
            timestamp: expect.any(Number),
            ukefExposureValue: 4000,
          },
          value: {
            currency: CURRENCY.GBP,
            value: 5000,
          },
        };

        expect(result).toEqual(expected);
      });

      it('should create tfm object when only getLatestCompletedAmendmentDate', async () => {
        externalApis.getFacilityExposurePeriod = jest.fn().mockResolvedValue({ exposurePeriodInMonths: 5 });
        externalApis.getLatestCompletedAmendmentValue = jest.fn().mockResolvedValue({});

        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        const expected = {
          amendmentExposurePeriodInMonths: 5,
          coverEndDate: unixTime,
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when TFM Facility end date feature flag enabled', () => {
      beforeEach(() => {
        jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
      });

      it('should not create tfm object when no getLatestCompletedAmendmentValue, getLatestCompletedAmendmentDate or getLatestFacilityEndDate', async () => {
        externalApis.getLatestCompletedAmendmentValue = jest.fn().mockResolvedValue({});
        externalApis.getLatestCompletedAmendmentDate = jest.fn().mockResolvedValue({});
        externalApis.getLatestCompletedAmendmentFacilityEndDate = jest.fn().mockResolvedValue({});

        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        expect(result).toEqual({});
      });

      it('should create tfm object when getLatestCompletedAmendmentValue, getLatestCompletedAmendmentDate and getLatestFacilityEndDate', async () => {
        externalApis.getFacilityExposurePeriod = jest.fn().mockResolvedValue({ exposurePeriodInMonths: 5 });

        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        const expected = {
          amendmentExposurePeriodInMonths: 5,
          coverEndDate: unixTime,
          facilityEndDate: isoString,
          exposure: {
            exposure: '4,000.00',
            timestamp: expect.any(Number),
            ukefExposureValue: 4000,
          },
          value: {
            currency: CURRENCY.GBP,
            value: 5000,
          },
        };

        expect(result).toEqual(expected);
      });

      it('should create tfm object when getLatestCompletedAmendmentValue only', async () => {
        externalApis.getLatestCompletedAmendmentDate = jest.fn().mockResolvedValue({});
        externalApis.getLatestCompletedAmendmentFacilityEndDate = jest.fn().mockResolvedValue({});

        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        const expected = {
          exposure: {
            exposure: '4,000.00',
            timestamp: expect.any(Number),
            ukefExposureValue: 4000,
          },
          value: {
            currency: CURRENCY.GBP,
            value: 5000,
          },
        };

        expect(result).toEqual(expected);
      });

      it('should create tfm object when only getLatestCompletedAmendmentDate', async () => {
        externalApis.getFacilityExposurePeriod = jest.fn().mockResolvedValue({ exposurePeriodInMonths: 5 });
        externalApis.getLatestCompletedAmendmentValue = jest.fn().mockResolvedValue({});
        externalApis.getLatestCompletedAmendmentFacilityEndDate = jest.fn().mockResolvedValue({});

        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        const expected = {
          amendmentExposurePeriodInMonths: 5,
          coverEndDate: unixTime,
        };

        expect(result).toEqual(expected);
      });

      it('should create tfm object when only getLatestCompletedAmendmentFacilityEndDate', async () => {
        externalApis.getFacilityExposurePeriod = jest.fn().mockResolvedValue({ exposurePeriodInMonths: 5 });
        externalApis.getLatestCompletedAmendmentValue = jest.fn().mockResolvedValue({});
        externalApis.getLatestCompletedAmendmentDate = jest.fn().mockResolvedValue({});

        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        const expected = {
          facilityEndDate: isoString,
        };

        expect(result).toEqual(expected);
      });

      it('should create tfm object when getLatestCompletedAmendmentFacilityEndDate and getLatestCompletedAmendmentDate', async () => {
        externalApis.getFacilityExposurePeriod = jest.fn().mockResolvedValue({ exposurePeriodInMonths: 5 });
        externalApis.getLatestCompletedAmendmentValue = jest.fn().mockResolvedValue({});

        const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

        const expected = {
          amendmentExposurePeriodInMonths: 5,
          coverEndDate: unixTime,
          facilityEndDate: isoString,
        };

        expect(result).toEqual(expected);
      });
    });
  });
});
