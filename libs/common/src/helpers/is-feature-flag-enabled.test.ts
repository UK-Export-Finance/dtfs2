import {
  FeatureFlag,
  isTfmFacilityEndDateFeatureFlagEnabled,
  isTfmPaymentReconciliationFeatureFlagEnabled,
} from './is-feature-flag-enabled';

const originalProcessEnv = { ...process.env };

describe('is-feature-flag-enabled helpers', () => {
  afterEach(() => {
    process.env = originalProcessEnv;
  });

  describe('isTfmPaymentReconciliationFeatureFlagEnabled', () => {
    const tfm6FeatureFlag: FeatureFlag = 'FF_TFM_PAYMENT_RECONCILIATION_ENABLED';

    it("returns false when the feature flag is set to 'false'", () => {
      // Arrange
      process.env[tfm6FeatureFlag] = 'false';

      // Act
      const result = isTfmPaymentReconciliationFeatureFlagEnabled();

      // Assert
      expect(result).toBe(false);
    });

    it("returns true when the feature flag is set to 'true'", () => {
      // Arrange
      process.env[tfm6FeatureFlag] = 'true';

      // Act
      const result = isTfmPaymentReconciliationFeatureFlagEnabled();

      // Assert
      expect(result).toBe(true);
    });

    it('defaults to false when the flag is not defined', () => {
      // Arrange
      delete process.env[tfm6FeatureFlag];

      // Act
      const result = isTfmPaymentReconciliationFeatureFlagEnabled();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isTfmFacilityEndDateFeatureFlagEnabled', () => {
    const tfmFacilityEndDateFeatureFlag: FeatureFlag = 'FF_TFM_FACILITY_END_DATE_ENABLED';

    it("returns false when the feature flag is set to 'false'", () => {
      // Arrange
      process.env[tfmFacilityEndDateFeatureFlag] = 'false';

      // Act
      const result = isTfmFacilityEndDateFeatureFlagEnabled();

      // Assert
      expect(result).toBe(false);
    });

    it("returns true when the feature flag is set to 'true'", () => {
      // Arrange
      process.env[tfmFacilityEndDateFeatureFlag] = 'true';

      // Act
      const result = isTfmFacilityEndDateFeatureFlagEnabled();

      // Assert
      expect(result).toBe(true);
    });

    it('defaults to false when the flag is not defined', () => {
      // Arrange
      delete process.env[tfmFacilityEndDateFeatureFlag];

      // Act
      const result = isTfmFacilityEndDateFeatureFlagEnabled();

      // Assert
      expect(result).toBe(false);
    });
  });
});
