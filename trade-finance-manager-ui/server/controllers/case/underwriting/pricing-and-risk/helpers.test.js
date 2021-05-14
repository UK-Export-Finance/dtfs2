/* eslint-disable no-underscore-dangle */
import {
  userCanEditExporterCreditRating,
  canUserEditFacilityRiskProfile,
} from './helpers';

describe('case - underwriting - pricing and risk - helpers', () => {
  describe('userCanEditExporterCreditRating', () => {
    it('should return true when user is in UNDERWRITING_SUPPORT team', () => {
      const result = userCanEditExporterCreditRating(
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: ['UNDERWRITING_SUPPORT'],
        },
      );

      expect(result).toEqual(true);
    });

    describe('when user is NOT in an allowed team', () => {
      it('should return false', () => {
        const result = userCanEditExporterCreditRating(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: ['TEST'],
          },
        );

        expect(result).toEqual(false);
      });
    });
  });

  describe('canUserEditFacilityRiskProfile', () => {
    it('should return true when user is in UNDERWRITER_MANAGERS team', () => {
      const result = canUserEditFacilityRiskProfile(
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: ['UNDERWRITER_MANAGERS'],
        },
      );

      expect(result).toEqual(true);
    });

    it('should return true when user is in UNDERWRITERS team', () => {
      const result = canUserEditFacilityRiskProfile(
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: ['UNDERWRITERS'],
        },
      );

      expect(result).toEqual(true);
    });

    describe('when user is NOT in an allowed team', () => {
      it('should return false', () => {
        const result = canUserEditFacilityRiskProfile(
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: ['TEST'],
          },
        );

        expect(result).toEqual(false);
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
