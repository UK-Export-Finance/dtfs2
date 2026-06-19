const { DEAL_TYPE } = require('@ukef/dtfs2-common');
const { amendIssuedFacility } = require('./amend-issued-facility');
const api = require('../api');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');
const { mapCashContingentFacility } = require('../mappings/map-submitted-deal/map-cash-contingent-facility');
const { mapBssEwcsFacility } = require('../mappings/map-submitted-deal/map-bss-ewcs-facility');

jest.mock('../api', () => ({
  updateFacility: jest.fn(),
}));
jest.mock('../helpers/get-guarantee-dates');
jest.mock('../mappings/map-submitted-deal/map-cash-contingent-facility');
jest.mock('../mappings/map-submitted-deal/map-bss-ewcs-facility');

describe('amendIssuedFacility', () => {
  const mockAuditDetails = { id: 'user-123', userType: 'tfm' };

  const baseFacility = {
    _id: 'facility-123',
    facilitySnapshot: {
      facilityType: DEAL_TYPE.BSS_EWCS,
      value: 1000000,
      coveredPercentage: 50,
    },
    tfm: {
      ukefExposure: 500000,
      exposurePeriodInMonths: 24,
    },
  };

  const baseAmendment = {
    amendmentId: 'amendment-123',
    dealId: 'deal-123',
    changeFacilityValue: false,
    changeCoverEndDate: false,
    coverEndDate: null,
    value: null,
    tfm: {
      amendmentExposurePeriodInMonths: 36,
      exposure: {
        ukefExposureValue: 600000,
        timestamp: 1234567890,
      },
    },
  };

  const baseBssDeal = {
    dealSnapshot: {
      dealType: DEAL_TYPE.BSS_EWCS,
      submissionDate: 1609459200000,
      details: {
        submissionDate: 1609459200000,
      },
      exporter: {
        companyName: 'Test Exporter',
      },
    },
    tfm: {},
  };

  const baseGefDeal = {
    dealSnapshot: {
      dealType: DEAL_TYPE.GEF,
      submissionDate: 1609459200000,
      exporter: {
        companyName: 'Test Exporter',
      },
    },
    tfm: {},
  };

  beforeEach(() => {
    jest.resetAllMocks();
    console.error = jest.fn();
    mapBssEwcsFacility.mockImplementation((facility) => facility);
    mapCashContingentFacility.mockImplementation((facility) => facility);
    getGuaranteeDates.mockReturnValue({
      guaranteeCommencementDate: 1609459200000,
      guaranteeExpiryDate: 1640995200000,
    });
  });

  describe('happy path - updates facility TFM with exposure', () => {
    it('should update facility TFM with exposure when amendment.tfm exists', async () => {
      // Arrange
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(baseAmendment, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      expect(api.updateFacility).toHaveBeenCalledTimes(1);
      const updateCall = api.updateFacility.mock.calls[0][0];
      expect(updateCall.tfmUpdate.exposurePeriodInMonths).toBe(36);
      expect(updateCall.tfmUpdate.ukefExposure).toBe(600000);
      expect(updateCall.tfmUpdate.ukefExposureCalculationTimestamp).toBe('1234567890');
    });

    it('should include history when tfm.history exists', async () => {
      // Arrange
      const facilityWithHistory = {
        ...baseFacility,
        tfm: {
          ...baseFacility.tfm,
          history: {
            version1: { ukefExposure: 400000 },
            version2: { ukefExposure: 500000 },
          },
        },
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(baseAmendment, facilityWithHistory, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      const updateCall = api.updateFacility.mock.calls[0][0];
      expect(updateCall.tfmUpdate.history).toHaveLength(3); // 2 existing + 1 new
      expect(updateCall.tfmUpdate.history[2].ukefExposure).toBe(500000);
    });
  });

  describe('handles missing or null exposure gracefully', () => {
    it('should not crash when exposure is undefined', async () => {
      // Arrange
      const amendmentWithoutExposure = {
        ...baseAmendment,
        tfm: {
          amendmentExposurePeriodInMonths: 36,
          exposure: undefined,
        },
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithoutExposure, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      const updateCall = api.updateFacility.mock.calls[0][0];
      expect(updateCall.tfmUpdate.ukefExposure).toBeUndefined();
      expect(updateCall.tfmUpdate.ukefExposureCalculationTimestamp).toBeUndefined();
    });

    it('should not crash when exposure is null', async () => {
      // Arrange
      const amendmentWithNullExposure = {
        ...baseAmendment,
        tfm: {
          amendmentExposurePeriodInMonths: 36,
          exposure: null,
        },
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithNullExposure, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      const updateCall = api.updateFacility.mock.calls[0][0];
      expect(updateCall.tfmUpdate.ukefExposure).toBeUndefined();
      expect(updateCall.tfmUpdate.ukefExposureCalculationTimestamp).toBeUndefined();
    });

    it('should not crash when exposure.ukefExposureValue is undefined', async () => {
      // Arrange
      const amendmentWithMissingValue = {
        ...baseAmendment,
        tfm: {
          amendmentExposurePeriodInMonths: 36,
          exposure: {
            timestamp: 1234567890,
          },
        },
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithMissingValue, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      const updateCall = api.updateFacility.mock.calls[0][0];
      expect(updateCall.tfmUpdate.ukefExposure).toBeUndefined();
    });

    it('should not crash when exposure.timestamp is undefined', async () => {
      // Arrange
      const amendmentWithMissingTimestamp = {
        ...baseAmendment,
        tfm: {
          amendmentExposurePeriodInMonths: 36,
          exposure: {
            ukefExposureValue: 600000,
          },
        },
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithMissingTimestamp, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      const updateCall = api.updateFacility.mock.calls[0][0];
      expect(updateCall.tfmUpdate.ukefExposure).toBe(600000);
      expect(updateCall.tfmUpdate.ukefExposureCalculationTimestamp).toBeUndefined();
    });
  });

  describe('updates facility value when changeFacilityValue is true', () => {
    it('should update amended facility with new value and exposure', async () => {
      // Arrange
      const amendmentWithValueChange = {
        ...baseAmendment,
        changeFacilityValue: true,
        value: 1500000,
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithValueChange, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      expect(mapBssEwcsFacility).toHaveBeenCalled();
      const mapCall = mapBssEwcsFacility.mock.calls[0][0];
      expect(mapCall.value).toBe(1500000);
      expect(mapCall.ukefExposure).toBe(600000);
    });

    it('should handle missing exposure when setting facility value', async () => {
      // Arrange
      const amendmentWithValueChangeNoExposure = {
        ...baseAmendment,
        changeFacilityValue: true,
        value: 1500000,
        tfm: {
          amendmentExposurePeriodInMonths: 36,
          exposure: null,
        },
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithValueChangeNoExposure, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      const mapCall = mapBssEwcsFacility.mock.calls[0][0];
      expect(mapCall.value).toBe(1500000);
      expect(mapCall.ukefExposure).toBeUndefined();
    });
  });

  describe('updates facility cover end date when changeCoverEndDate is true', () => {
    it('should format cover end date fields for BSS/EWCS facility', async () => {
      // Arrange
      // Using 2024-06-15 00:00:00 UTC = 1718390400 seconds
      const coverEndDateSeconds = 1718390400;
      const amendmentWithCoverDateChange = {
        ...baseAmendment,
        changeCoverEndDate: true,
        coverEndDate: coverEndDateSeconds,
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithCoverDateChange, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      expect(getGuaranteeDates).toHaveBeenCalled();
      const mapCall = mapBssEwcsFacility.mock.calls[0][0];
      const expectedDate = new Date(coverEndDateSeconds * 1000);
      expect(mapCall['coverEndDate-day']).toBe(expectedDate.getUTCDate());
      expect(mapCall['coverEndDate-month']).toBe(expectedDate.getUTCMonth() + 1);
      expect(mapCall['coverEndDate-year']).toBe(expectedDate.getUTCFullYear());
    });

    it('should format cover end date as Date object for GEF facility', async () => {
      // Arrange
      // Using 2024-06-15 00:00:00 UTC = 1718390400 seconds
      const coverEndDateSeconds = 1718390400;
      const amendmentWithCoverDateChange = {
        ...baseAmendment,
        changeCoverEndDate: true,
        coverEndDate: coverEndDateSeconds,
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithCoverDateChange, baseFacility, baseGefDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      expect(mapCashContingentFacility).toHaveBeenCalled();
      const mapCall = mapCashContingentFacility.mock.calls[0][0];
      expect(mapCall.coverEndDate).toEqual(new Date(1718390400000));
    });

    it('should call getGuaranteeDates and include facility guarantee dates in TFM update', async () => {
      // Arrange
      // Using 2024-06-15 00:00:00 UTC = 1718390400 seconds
      const coverEndDateSeconds = 1718390400;
      const amendmentWithCoverDateChange = {
        ...baseAmendment,
        changeCoverEndDate: true,
        coverEndDate: coverEndDateSeconds,
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithCoverDateChange, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      expect(getGuaranteeDates).toHaveBeenCalled();
      const updateCall = api.updateFacility.mock.calls[0][0];
      expect(updateCall.tfmUpdate.facilityGuaranteeDates).toEqual({
        guaranteeCommencementDate: 1609459200000,
        guaranteeExpiryDate: 1640995200000,
      });
    });
  });

  describe('handles both changeFacilityValue and changeCoverEndDate', () => {
    it('should update both value and cover end date when both are true', async () => {
      // Arrange
      // Using 2024-06-15 00:00:00 UTC = 1718390400 seconds
      const coverEndDateSeconds = 1718390400;
      const amendmentWithBothChanges = {
        ...baseAmendment,
        changeFacilityValue: true,
        changeCoverEndDate: true,
        value: 1500000,
        coverEndDate: coverEndDateSeconds,
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      const result = await amendIssuedFacility(amendmentWithBothChanges, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true);
      const mapCall = mapBssEwcsFacility.mock.calls[0][0];
      expect(mapCall.value).toBe(1500000);
      const expectedDate = new Date(coverEndDateSeconds * 1000);
      expect(mapCall['coverEndDate-day']).toBe(expectedDate.getUTCDate());
      expect(mapCall['coverEndDate-month']).toBe(expectedDate.getUTCMonth() + 1);
      expect(mapCall['coverEndDate-year']).toBe(expectedDate.getUTCFullYear());
    });
  });

  describe('handles different deal types correctly', () => {
    it('should call mapBssEwcsFacility for BSS/EWCS deals', async () => {
      // Arrange
      api.updateFacility.mockResolvedValue({});

      // Act
      await amendIssuedFacility(baseAmendment, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(mapBssEwcsFacility).toHaveBeenCalled();
      expect(mapCashContingentFacility).not.toHaveBeenCalled();
    });

    it('should call mapCashContingentFacility for GEF deals', async () => {
      // Arrange
      api.updateFacility.mockResolvedValue({});

      // Act
      await amendIssuedFacility(baseAmendment, baseFacility, baseGefDeal, mockAuditDetails);

      // Assert
      expect(mapCashContingentFacility).toHaveBeenCalled();
      expect(mapBssEwcsFacility).not.toHaveBeenCalled();
    });

    it('should use correct submission date from deal for BSS/EWCS', async () => {
      // Arrange
      api.updateFacility.mockResolvedValue({});

      // Act
      await amendIssuedFacility(baseAmendment, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(getGuaranteeDates).not.toHaveBeenCalled(); // Called only when changeCoverEndDate is true
    });

    it('should use correct submission date from deal for GEF', async () => {
      // Arrange
      api.updateFacility.mockResolvedValue({});

      // Act
      await amendIssuedFacility(baseAmendment, baseFacility, baseGefDeal, mockAuditDetails);

      // Assert
      expect(mapCashContingentFacility).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return false when amendment is null', async () => {
      // Act
      const result = await amendIssuedFacility(null, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error amending issued facility TFM properties %o', expect.any(Error));
      expect(api.updateFacility).not.toHaveBeenCalled();
    });

    it('should return false when facility is null', async () => {
      // Act
      const result = await amendIssuedFacility(baseAmendment, null, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error amending issued facility TFM properties %o', expect.any(Error));
      expect(api.updateFacility).not.toHaveBeenCalled();
    });

    it('should return false when deal is null', async () => {
      // Act
      const result = await amendIssuedFacility(baseAmendment, baseFacility, null, mockAuditDetails);

      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error amending issued facility TFM properties %o', expect.any(Error));
      expect(api.updateFacility).not.toHaveBeenCalled();
    });

    it('should return false when api.updateFacility throws error', async () => {
      // Arrange
      const updateError = new Error('Database update failed');
      api.updateFacility.mockRejectedValue(updateError);

      // Act
      const result = await amendIssuedFacility(baseAmendment, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error amending issued facility TFM properties %o', updateError);
    });

    it('should return false when amendment.tfm is missing', async () => {
      // Arrange
      const amendmentWithoutTfm = {
        ...baseAmendment,
        tfm: null,
      };

      // Act
      const result = await amendIssuedFacility(amendmentWithoutTfm, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(result).toBe(true); // This path doesn't update facility, but completes successfully
      expect(api.updateFacility).not.toHaveBeenCalled();
    });
  });

  describe('passes correct parameters to api.updateFacility', () => {
    it('should call api.updateFacility with facilityId, tfmUpdate, and auditDetails', async () => {
      // Arrange
      api.updateFacility.mockResolvedValue({});

      // Act
      await amendIssuedFacility(baseAmendment, baseFacility, baseBssDeal, mockAuditDetails);

      // Assert
      expect(api.updateFacility).toHaveBeenCalledWith({
        facilityId: baseFacility._id,
        tfmUpdate: expect.objectContaining({
          exposurePeriodInMonths: 36,
          ukefExposure: 600000,
          ukefExposureCalculationTimestamp: '1234567890',
          history: expect.any(Array),
        }),
        auditDetails: mockAuditDetails,
      });
    });

    it('should preserve existing tfm properties in tfmUpdate', async () => {
      // Arrange
      const facilityWithExistingProperties = {
        ...baseFacility,
        tfm: {
          ...baseFacility.tfm,
          premiumSchedule: [{ month: 1, premium: 1000 }],
          facilityGuaranteeDates: { commencementDate: 123456 },
        },
      };
      api.updateFacility.mockResolvedValue({});

      // Act
      await amendIssuedFacility(baseAmendment, facilityWithExistingProperties, baseBssDeal, mockAuditDetails);

      // Assert
      const updateCall = api.updateFacility.mock.calls[0][0];
      expect(updateCall.tfmUpdate.premiumSchedule).toEqual([{ month: 1, premium: 1000 }]);
      expect(updateCall.tfmUpdate.facilityGuaranteeDates).toEqual({ commencementDate: 123456 });
    });
  });
});
