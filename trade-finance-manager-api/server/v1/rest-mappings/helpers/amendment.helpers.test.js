const { CURRENCY, TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS, isPortalFacilityAmendmentsFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { add } = require('date-fns');
const amendmentHelpers = require('./amendment.helpers');

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
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
        status: TFM_AMENDMENT_STATUS.COMPLETED,
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
      { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.IN_PROGRESS) },
      { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.IN_PROGRESS) },
      { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.IN_PROGRESS) },
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
      { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.IN_PROGRESS), tfm: anotherAmendmentTfmObject, version: 1 },
      { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: anotherAmendmentTfmObject, version: 2 },
      { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: latestAmendmentTfmObject, version: 3 },
      { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: null, version: 4 },
    ];

    // Act
    const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

    // Assert

    expect(result).toEqual(latestAmendmentTfmObject);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is disabled', () => {
    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(false);
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
      const secondAmendmentTfmObject = { ...anAmendmentTfmObject(), updatedAt: 1723641633, version: 2 };
      const thirdAmendmentTfmObject = {
        ...anAmendmentTfmObject(),
        isUsingFacilityEndDate: true,
        facilityEndDate: new Date('2024-01-01'),
        updatedAt: secondAmendmentTfmObject.updatedAt - 50,
        version: 3,
      };

      const amendments = [
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: firstAmendmentTfmObject, version: 1 },
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: secondAmendmentTfmObject, version: 2 },
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: thirdAmendmentTfmObject, version: 3 },
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
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: firstAmendmentTfmObject, version: 1 },
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: secondAmendmentTfmObject, version: 2 },
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: thirdAmendmentTfmObject, version: 3 },
      ];

      // Act
      const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

      // Assert
      expect(result.bankReviewDate).toEqual(new Date('2025-05-05'));
      expect(result.isUsingFacilityEndDate).toEqual(false);
      expect(result.facilityEndDate).toBeUndefined();
    });

    it('should return a portal amendment if it is the latest amendment', () => {
      // Arrange
      const latestAmendmentTfmObject = {
        ...anAmendmentTfmObject(),
        value: 3000,
        coverEndDate: new Date('2023-12-12').getTime(),
        bankReviewDate: undefined,
        facilityEndDate: undefined,
        isUsingFacilityEndDate: undefined,
      };
      const anotherAmendmentTfmObject = { ...anAmendmentTfmObject(), value: 1000, coverEndDate: null };
      const amendments = [
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.IN_PROGRESS), tfm: anotherAmendmentTfmObject, version: 1 },
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: anotherAmendmentTfmObject, version: 2 },
        { ...anAmendmentWithStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED), tfm: latestAmendmentTfmObject, version: 3 },
      ];

      // Act
      const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

      // Assert
      expect(result).toEqual(latestAmendmentTfmObject);
    });

    it('should return the original values if effective date is in the future', () => {
      // Arrange
      const tomorrow = add(new Date(), { days: 1 });

      const latestAmendmentTfmObject = {
        ...anAmendmentTfmObject(),
        value: 3000,
        coverEndDate: new Date('2023-12-12').getTime(),
        bankReviewDate: undefined,
        facilityEndDate: undefined,
        isUsingFacilityEndDate: undefined,
        effectiveDate: tomorrow.getTime(),
      };

      const anotherAmendmentTfmObject = { ...anAmendmentTfmObject(), value: 1000, coverEndDate: null };
      const amendments = [
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.IN_PROGRESS), tfm: anotherAmendmentTfmObject, version: 1 },
        { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: anotherAmendmentTfmObject, version: 2 },
        { ...anAmendmentWithStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED), tfm: latestAmendmentTfmObject, version: 3 },
      ];

      // Act
      const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

      // Assert
      const expected = { ...latestAmendmentTfmObject };
      delete expected.effectiveDate;

      expect(result).toEqual(expected);
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);
    });

    describe('when no reference numbers are present', () => {
      it('should return the latest submitted amendment by version', () => {
        // Arrange
        const firstAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: false,
          bankReviewDate: new Date('2023-12-12'),
          updatedAt: 1723641611,
          version: 1,
        };
        const secondAmendmentTfmObject = { ...anAmendmentTfmObject(), updatedAt: 1723641633, version: 2 };
        const thirdAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: true,
          facilityEndDate: new Date('2024-01-01'),
          updatedAt: secondAmendmentTfmObject.updatedAt - 50,
          version: 3,
        };

        const amendments = [
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: firstAmendmentTfmObject, version: 1 },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: secondAmendmentTfmObject, version: 2 },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: thirdAmendmentTfmObject, version: 3 },
        ];

        // Act
        const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

        // Assert
        expect(result.facilityEndDate).toEqual(new Date('2024-01-01'));
        expect(result.isUsingFacilityEndDate).toEqual(true);
        expect(result.bankReviewDate).toBeUndefined();
      });
    });

    describe('when reference numbers are present', () => {
      it('should return the latest submitted facility end date fields for the latest reference number amendment', () => {
        // Arrange
        const firstAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: false,
          bankReviewDate: new Date('2023-12-12'),
          updatedAt: 1723641611,
          version: 1,
        };
        const secondAmendmentTfmObject = { ...anAmendmentTfmObject(), updatedAt: 1723641633, version: 2 };
        const thirdAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: true,
          facilityEndDate: new Date('2024-01-01'),
          updatedAt: secondAmendmentTfmObject.updatedAt - 50,
          version: 3,
        };

        const amendments = [
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: firstAmendmentTfmObject, version: 1, referenceNumber: '0011-003' },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: secondAmendmentTfmObject, version: 2, referenceNumber: '0011-001' },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: thirdAmendmentTfmObject, version: 3, referenceNumber: '0011-002' },
        ];

        // Act
        const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

        // Assert
        expect(result.facilityEndDate).toEqual(amendments[0].tfm.facilityEndDate);
        expect(result.isUsingFacilityEndDate).toEqual(amendments[0].tfm.isUsingFacilityEndDate);
        expect(result.bankReviewDate).toEqual(amendments[0].tfm.bankReviewDate);
      });
    });

    describe('when mix of version and referenceNumbers', () => {
      it('should return the latest submitted facility end date fields for the latest reference number amendment', () => {
        // Arrange
        const firstAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: false,
          bankReviewDate: new Date('2023-12-12'),
          updatedAt: 1723641611,
          version: 1,
        };
        const secondAmendmentTfmObject = { ...anAmendmentTfmObject(), updatedAt: 1723641633, version: 2 };
        const thirdAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: true,
          facilityEndDate: new Date('2024-01-01'),
          updatedAt: secondAmendmentTfmObject.updatedAt - 50,
          version: 3,
        };

        const amendments = [
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: firstAmendmentTfmObject, version: 1, referenceNumber: '0011-003' },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: secondAmendmentTfmObject, version: 2 },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: thirdAmendmentTfmObject, version: 3, referenceNumber: '0011-002' },
        ];

        // Act
        const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

        // Assert
        expect(result.facilityEndDate).toEqual(amendments[0].tfm.facilityEndDate);
        expect(result.isUsingFacilityEndDate).toEqual(amendments[0].tfm.isUsingFacilityEndDate);
        expect(result.bankReviewDate).toEqual(amendments[0].tfm.bankReviewDate);
      });
    });

    describe('when mix of version and referenceNumbers and referenceNumber as ""', () => {
      it('should return the latest submitted facility end date fields for the latest reference number amendment', () => {
        // Arrange
        const firstAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: false,
          bankReviewDate: new Date('2023-12-12'),
          updatedAt: 1723641611,
          version: 1,
        };
        const secondAmendmentTfmObject = { ...anAmendmentTfmObject(), updatedAt: 1723641633, version: 2 };
        const thirdAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: true,
          facilityEndDate: new Date('2024-01-01'),
          updatedAt: secondAmendmentTfmObject.updatedAt - 50,
          version: 3,
        };

        const amendments = [
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: firstAmendmentTfmObject, version: 1 },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: secondAmendmentTfmObject, version: 2, referenceNumber: '' },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: thirdAmendmentTfmObject, version: 3, referenceNumber: '0011-002' },
        ];

        // Act
        const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

        // Assert
        expect(result.facilityEndDate).toEqual(amendments[2].tfm.facilityEndDate);
        expect(result.isUsingFacilityEndDate).toEqual(amendments[2].tfm.isUsingFacilityEndDate);
        expect(result.bankReviewDate).toEqual(amendments[2].tfm.bankReviewDate);
      });
    });

    describe('when mix of version and and referenceNumber as ""', () => {
      it('should return the latest submitted facility end date fields for the latest reference number amendment', () => {
        // Arrange
        const firstAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: false,
          bankReviewDate: new Date('2023-12-12'),
          updatedAt: 1723641611,
          version: 1,
        };
        const secondAmendmentTfmObject = { ...anAmendmentTfmObject(), updatedAt: 1723641633, version: 2 };
        const thirdAmendmentTfmObject = {
          ...anAmendmentTfmObject(),
          isUsingFacilityEndDate: true,
          facilityEndDate: new Date('2024-01-01'),
          updatedAt: secondAmendmentTfmObject.updatedAt - 50,
          version: 3,
        };

        const amendments = [
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: firstAmendmentTfmObject, version: 1 },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: secondAmendmentTfmObject, version: 2 },
          { ...anAmendmentWithStatus(TFM_AMENDMENT_STATUS.COMPLETED), tfm: thirdAmendmentTfmObject, version: 3, referenceNumber: '' },
        ];

        // Act
        const result = amendmentHelpers.findLatestCompletedAmendment(amendments);

        // Assert
        expect(result.facilityEndDate).toEqual(amendments[2].tfm.facilityEndDate);
        expect(result.isUsingFacilityEndDate).toEqual(amendments[2].tfm.isUsingFacilityEndDate);
        expect(result.bankReviewDate).toEqual(amendments[2].tfm.bankReviewDate);
      });
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
