const amendmentController = require('../../../src/v1/controllers/amendment.controller');
const { AMENDMENT_STATUS } = require('../../../src/constants/deals');
const { CURRENCY } = require('../../../src/constants/currency.constant');
const externalApis = require('../../../src/v1/api');
const MOCK_GEF_AIN_DEAL = require('../../../src/v1/__mocks__/mock-TFM-deal-AIN-submitted');

describe('update amendment-tfm on amendment completion', () => {
  const unixTime = 1658403289;

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

  const updateDealSpy = jest.fn(() => Promise.resolve(
    mockDeal,
  ));

  const valueChange = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '111',
  };

  const dateChange = {
    coverEndDate: unixTime,
  };

  const mockFacility = {
    facilitySnapshot: { ...MOCK_GEF_AIN_DEAL.dealSnapshot.facilities[0] },
  };

  beforeEach(() => {
    updateDealSpy.mockClear();
    externalApis.getAmendmentById = jest.fn(() => Promise.resolve(mockAmendment));
    externalApis.getLatestCompletedValueAmendment = jest.fn(() => Promise.resolve(valueChange));
    externalApis.getLatestCompletedDateAmendment = jest.fn(() => Promise.resolve(dateChange));

    externalApis.updateFacilityAmendment = jest.fn(() => Promise.resolve(mockAmendment));
    externalApis.findOneDeal = jest.fn(() => Promise.resolve(MOCK_GEF_AIN_DEAL));
    externalApis.findOneFacility = jest.fn(() => Promise.resolve(mockFacility));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('createAmendmentTFMObject() - should not create tfm object when no getLatestCompletedValueAmendment or getLatestCompletedDateAmendment', async () => {
    externalApis.getLatestCompletedValueAmendment = jest.fn(() => Promise.resolve({}));
    externalApis.getLatestCompletedDateAmendment = jest.fn(() => Promise.resolve({}));
    const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

    expect(result).toEqual({});
  });

  it('createAmendmentTFMObject() - should create tfm object when getLatestCompletedValueAmendment and getLatestCompletedDateAmendment', async () => {
    externalApis.getFacilityExposurePeriod = jest.fn(() => Promise.resolve({ exposurePeriodInMonths: 5 }));

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

  it('createAmendmentTFMObject() - should create tfm object when getLatestCompletedValueAmendment and getLatestCompletedDateAmendment', async () => {
    externalApis.getFacilityExposurePeriod = jest.fn(() => Promise.resolve({ exposurePeriodInMonths: 5 }));

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

  it('createAmendmentTFMObject() - should create tfm object when getLatestCompletedValueAmendment only', async () => {
    externalApis.getLatestCompletedDateAmendment = jest.fn(() => Promise.resolve({}));

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

  it('createAmendmentTFMObject() - should create tfm object when only getLatestCompletedDateAmendment', async () => {
    externalApis.getFacilityExposurePeriod = jest.fn(() => Promise.resolve({ exposurePeriodInMonths: 5 }));
    externalApis.getLatestCompletedValueAmendment = jest.fn(() => Promise.resolve({}));

    const result = await amendmentController.createAmendmentTFMObject(mockAmendment.amendmentId, mockAmendment.facilityId);

    const expected = {
      amendmentExposurePeriodInMonths: 5,
      coverEndDate: unixTime,
    };

    expect(result).toEqual(expected);
  });
});
