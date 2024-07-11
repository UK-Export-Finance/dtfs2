import { ZodError } from 'zod';
import { isFacilityEndDateEnabledOnGefVersion, getCurrentGefDealVersion } from './gef-deal-versioning';

const originalProcessEnv = { ...process.env };

describe('is-deal-feature-enabled helpers', () => {
  afterEach(() => {
    process.env = originalProcessEnv;
  });

  describe('getCurrentGefDealVersion', () => {
    it("returns 1 when deal version set to '1'", () => {
      process.env.GEF_DEAL_VERSION = '1';

      const result = getCurrentGefDealVersion();

      expect(result).toBe(1);
    });

    it("returns 0 when deal version set to '0'", () => {
      process.env.GEF_DEAL_VERSION = '0';

      const result = getCurrentGefDealVersion();

      expect(result).toBe(0);
    });

    it('returns 0 when deal version set to empty string', () => {
      process.env.GEF_DEAL_VERSION = '';

      const result = getCurrentGefDealVersion();

      expect(result).toBe(0);
    });

    it('returns 0 when deal version undefined', () => {
      delete process.env.GEF_DEAL_VERSION;

      const result = getCurrentGefDealVersion();

      expect(result).toBe(0);
    });

    it('throws an error when deal version is invalid', () => {
      process.env.GEF_DEAL_VERSION = '1x';

      expect(() => getCurrentGefDealVersion()).toThrow(ZodError);
    });
  });

  describe('isFacilityEndDateEnabledOnGefVersion', () => {
    it('returns true when deal version set to 1', () => {
      const result = isFacilityEndDateEnabledOnGefVersion(1);

      expect(result).toBe(true);
    });

    it('returns true when deal version greater than 1', () => {
      const result = isFacilityEndDateEnabledOnGefVersion(2);

      expect(result).toBe(true);
    });

    it('returns false when deal version less than 1', () => {
      const result = isFacilityEndDateEnabledOnGefVersion(0);

      expect(result).toBe(false);
    });
  });
});
