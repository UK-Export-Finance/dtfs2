import { FeatureFlag, isTfmPaymentReconciliationFeatureFlagEnabled } from './is-feature-flag-enabled';

const originalEnv = { ...process.env };

describe('is-feature-flag-enabled helpers', () => {
  afterEach(() => {
    process.env = originalEnv;
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
});
