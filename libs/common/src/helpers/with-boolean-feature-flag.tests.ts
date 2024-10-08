import { FeatureFlag } from './is-feature-flag-enabled';

const originalEnv = { ...process.env };

export const withBooleanFeatureFlagTests = ({ featureFlagName, getFeatureFlagValue }: { featureFlagName: FeatureFlag; getFeatureFlagValue: () => boolean }) => {
  describe(`${featureFlagName}`, () => {
    afterAll(() => {
      process.env = originalEnv;
    });

    it("returns false when the feature flag is set to 'false'", () => {
      // Arrange
      process.env[featureFlagName] = 'false';

      // Act
      const result = getFeatureFlagValue();

      // Assert
      expect(result).toBe(false);
    });

    it("returns true when the feature flag is set to 'true'", () => {
      // Arrange
      process.env[featureFlagName] = 'true';

      // Act
      const result = getFeatureFlagValue();

      // Assert
      expect(result).toBe(true);
    });

    it('defaults to false when the flag is not defined', () => {
      // Arrange
      delete process.env[featureFlagName];

      // Act
      const result = getFeatureFlagValue();

      // Assert
      expect(result).toBe(false);
    });
  });
};
