const { CURRENCY, AMENDMENT_STATUS, isTfmFacilityEndDateFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const amendmentHelpers = require('./amendment.helpers');

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('amendmentChangeValueExportCurrency()', () => {
  const amendment = { currency: CURRENCY.GBP };

  it('should return a string with currency and value to 2 decimal places', () => {
    amendment.value = 25000;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    const expected = `${CURRENCY.GBP} 25,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return a string with currency and value to 2 decimal points even if different currency', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    const expected = `${CURRENCY.JPY} 25,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return null if no value', () => {
    amendment.value = null;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    expect(result).toBeNull();
  });

  it('should return null if no currency', () => {
    amendment.value = 25000;
    amendment.currency = null;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    expect(result).toBeNull();
  });

  it('should return null if no currency or no value', () => {
    amendment.value = null;
    amendment.currency = null;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    expect(result).toBeNull();
  });
});

describe('calculateNewFacilityValue()', () => {
  const amendment = { currency: CURRENCY.GBP };

  it('should return the same number since in GBP', () => {
    amendment.value = 25000;

    const result = amendmentHelpers.calculateNewFacilityValue(null, amendment);
    const expected = amendment.value;
    expect(result).toEqual(expected);
  });

  it('should return a number if different currency', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = 7.1;

    const result = amendmentHelpers.calculateNewFacilityValue(exchangeRate, amendment);
    const expected = amendment.value * exchangeRate;
    expect(result).toEqual(expected);
  });

  it('should return null if no facility value or currency in amendment', () => {
    amendment.value = null;
    amendment.currency = null;
    const exchangeRate = 7.1;

    const result = amendmentHelpers.calculateNewFacilityValue(exchangeRate, amendment);
    expect(result).toBeNull();
  });

  it('should return null if no exchange rate if currency not GBP', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = null;

    const result = amendmentHelpers.calculateNewFacilityValue(exchangeRate, amendment);
    expect(result).toBeNull();
  });
});

describe('calculateUkefExposure()', () => {
  it('should return the cover percentage without rounding when not needed', () => {
    const facilityValueInGBP = '5000';
    const coverPercentage = 80;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    const expected = 5000 * (80 / 100);
    expect(result).toEqual(expected);
  });

  it('should return a rounded number when more than 2 decimal places', () => {
    const facilityValueInGBP = '5165.2';
    const coverPercentage = 33;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    const expected = 1704.52;
    expect(result).toEqual(expected);
  });

  it('should return null if no facility value', () => {
    const facilityValueInGBP = null;
    const coverPercentage = 33;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });

  it('should return null if no cover percentage', () => {
    const facilityValueInGBP = '5165.2';
    const coverPercentage = null;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });

  it('should return null if no cover percentage and facility value', () => {
    const facilityValueInGBP = null;
    const coverPercentage = null;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });
});

describe('calculateAmendmentTotalExposure()', () => {
  const mockAmendmentValueResponse = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
  };

  const mockFacility = {
    _id: '123',
    facilitySnapshot: {
      type: 'Bond',
      coverPercentage: 25,
    },
    tfm: {
      ukefExposure: 23000.0,
      facilityValueInGBP: 1034.7800881821,
    },
    amendments: [{ ...mockAmendmentValueResponse }],
  };

  it('should null if amendment not completed', () => {
    const result = amendmentHelpers.calculateAmendmentTotalExposure(mockFacility);
    expect(result).toBeNull();
  });

  it('should return exposure value when amendment completed', () => {
    mockFacility.amendments = [
      {
        updatedAt: new Date('2023-12-12').getTime(),
        version: 0,
        status: AMENDMENT_STATUS.COMPLETED,
        tfm: {
          value: { ...mockAmendmentValueResponse },
        },
      },
    ];
    const result = amendmentHelpers.calculateAmendmentTotalExposure(mockFacility);
    const expected = mockAmendmentValueResponse.value * (mockFacility.facilitySnapshot.coverPercentage / 100);
    expect(result).toEqual(expected);
  });
});

describe('findLatestCompletedAmendment()', () => {
  const anAmendmentTfmExposureObject = () => ({
    exposure: 1,
    timestamp: new Date().getTime(),
  });

  const anAmendmentTfmObject = () => ({
    value: 1000,
    amendmentExposurePeriodInMonths: 12,
    exposure: anAmendmentTfmExposureObject(),
    coverEndDate: new Date().getTime(),
  });

  const updatedAtTimestamp = timestampGenerator();

  const anAmendmentWithStatus = (status) => ({
    status,
    updatedAt: updatedAtTimestamp.next().value,
    version: 0,
    tfm: anAmendmentTfmObject(),
  });

  it('should return an empty object if there are no completed amendments', () => {
    // Arrange
    const amendments = [
      { ...anAmendmentWithStatus(AMENDMENT_STATUS.IN_PROGRESS) },
      { ...anAmendmentWithStatus(AMENDMENT_STATUS.IN_PROGRESS) },
      { ...anAmendmentWithStatus(AMENDMENT_STATUS.IN_PROGRESS) },
    ];

    // Act
    const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

    // Assert
    expect(result).toEqual({});
  });

  it('sets the tfm related fields to the latest completed amendment with a defined tfm object', () => {
    // Arrange
    const latestAmendmentTfmObject = { ...anAmendmentTfmObject(), value: 3000, coverEndDate: new Date('2023-12-12').getTime() };
    const anotherAmendmentTfmObject = { ...anAmendmentTfmObject(), value: 1000, coverEndDate: null };
    const amendments = [
      { ...anAmendmentWithStatus(AMENDMENT_STATUS.IN_PROGRESS), tfm: anotherAmendmentTfmObject },
      { ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: anotherAmendmentTfmObject },
      { ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: latestAmendmentTfmObject },
      { ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: null },
    ];

    // Act
    const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

    // Assert

    expect(result).toEqual(latestAmendmentTfmObject);
  });

  describe('when Facility end date feature flag not enabled', () => {
    beforeAll(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should not return facility end date fields', () => {
      // Arrange
      const latestAmendmentTfmObject = { ...anAmendmentTfmObject(), isUsingFacilityEndDate: true, facilityEndDate: new Date('2023-12-12') };
      const amendments = [{ ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: latestAmendmentTfmObject }];

      // Act
      const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

      // Assert
      expect(result.isUsingFacilityEndDate).toBeUndefined();
      expect(result.facilityEndDate).toBeUndefined();
      expect(result.bankReviewDate).toBeUndefined();
    });
  });

  describe('when Facility end date feature flag is enabled', () => {
    beforeAll(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should return the latest submitted facility end date fields when the most recently submitted value had isUsingFacilityEndDate as true', () => {
      // Arrange
      const firstAmendmentTfmObject = {
        ...anAmendmentTfmObject(),
        isUsingFacilityEndDate: false,
        bankReviewDate: new Date('2023-12-12'),
        updatedAt: 1723641611,
        version: 1,
      };
      const secondAmendmentTfmObject = {
        ...anAmendmentTfmObject(),
        isUsingFacilityEndDate: true,
        facilityEndDate: new Date('2024-01-01'),
        updatedAt: 1723641622,
        version: 2,
      };
      const thirdAmendmentTfmObject = { ...anAmendmentTfmObject(), updatedAt: 1723641633, version: 3 };

      const amendments = [
        { ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: firstAmendmentTfmObject },
        { ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: secondAmendmentTfmObject },
        { ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: thirdAmendmentTfmObject },
      ];

      // Act
      const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

      // Assert
      expect(result.facilityEndDate).toEqual(new Date('2024-01-01'));
      expect(result.isUsingFacilityEndDate).toEqual(true);
      expect(result.bankReviewDate).toBeUndefined();
    });

    it('should return the latest submitted facility end date fields when the most recently submitted value had isUsingFacilityEndDate as false', () => {
      // Arrange
      const firstAmendmentTfmObject = {
        ...anAmendmentTfmObject(),
        isUsingFacilityEndDate: true,
        facilityEndDate: new Date('2023-12-12'),
        updatedAt: 1723641611,
        version: 1,
      };
      const secondAmendmentTfmObject = {
        ...anAmendmentTfmObject(),
        isUsingFacilityEndDate: false,
        bankReviewDate: new Date('2025-05-05'),
        updatedAt: 1723641622,
        version: 2,
      };
      const thirdAmendmentTfmObject = { ...anAmendmentTfmObject(), updatedAt: 1723641633, version: 3 };

      const amendments = [
        { ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: firstAmendmentTfmObject },
        { ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: secondAmendmentTfmObject },
        { ...anAmendmentWithStatus(AMENDMENT_STATUS.COMPLETED), tfm: thirdAmendmentTfmObject },
      ];

      // Act
      const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

      // Assert
      expect(result.bankReviewDate).toEqual(new Date('2025-05-05'));
      expect(result.isUsingFacilityEndDate).toEqual(false);
      expect(result.facilityEndDate).toBeUndefined();
    });
  });

  function* timestampGenerator() {
    let timestamp = new Date().getTime();
    while (true) {
      yield timestamp;
      timestamp += 10000; // add 10 seconds
    }
  }
});
