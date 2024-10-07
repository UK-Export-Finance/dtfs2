import { calculateInitialUtilisation } from '@ukef/dtfs2-common';
import { calculateInitialUtilisationAndFixedFee, hasRequiredValues } from './calculate-initial-utilisation-and-fixed-fee';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { aTfmFacility } from '../../../../../../test-helpers';
import { calculateFixedFee } from './calculate-fixed-fee';

describe('helpers/calculate-initial-utilisation-and-fixed-fee', () => {
  describe('hasRequiredValues', () => {
    it('should return true if all values are present', () => {
      const params = {
        value: 1,
        interestPercentage: 2,
        dayCountBasis: 3,
        coverStartDate: new Date(),
        coverEndDate: new Date(),
      };

      const result = hasRequiredValues(params);
      expect(result).toEqual(true);
    });

    it('should return false if the value is not provided', () => {
      const params = {
        value: null,
        interestPercentage: 2,
        dayCountBasis: 3,
        coverStartDate: new Date(),
        coverEndDate: new Date(),
      };

      const result = hasRequiredValues(params);
      expect(result).toEqual(false);
    });

    it('should return false if the interestPercentage is not provided', () => {
      const params = {
        value: 1,
        interestPercentage: null,
        dayCountBasis: 3,
        coverStartDate: new Date(),
        coverEndDate: new Date(),
      };

      const result = hasRequiredValues(params);
      expect(result).toEqual(false);
    });

    it('should return false if the dayCountBasis is not provided', () => {
      const params = {
        value: 1,
        interestPercentage: 2,
        dayCountBasis: null,
        coverStartDate: new Date(),
        coverEndDate: new Date(),
      };

      const result = hasRequiredValues(params);
      expect(result).toEqual(false);
    });

    it('should return false if the coverEndDate is not provided', () => {
      const params = {
        value: 1,
        interestPercentage: 2,
        dayCountBasis: 3,
        coverStartDate: new Date(),
        coverEndDate: null,
      };

      const result = hasRequiredValues(params);
      expect(result).toEqual(false);
    });

    it('should return false if the coverStartDate is not provided', () => {
      const params = {
        value: 1,
        interestPercentage: 2,
        dayCountBasis: 3,
        coverStartDate: null,
        coverEndDate: new Date(),
      };

      const result = hasRequiredValues(params);
      expect(result).toEqual(false);
    });

    it('should return false if the coverStartDate is the wrong format', () => {
      const params = {
        value: 1,
        interestPercentage: 2,
        dayCountBasis: 3,
        coverStartDate: 'a',
        coverEndDate: new Date(),
      };

      const result = hasRequiredValues(params);
      expect(result).toEqual(false);
    });

    it('should return false if the coverEndDate is the wrong format', () => {
      const params = {
        value: 1,
        interestPercentage: 2,
        dayCountBasis: 3,
        coverStartDate: new Date(),
        coverEndDate: 'a',
      };

      const result = hasRequiredValues(params);
      expect(result).toEqual(false);
    });
  });

  describe('calculateInitialUtilisationAndFixedFee', () => {
    const findOneByUkefFacilityIdSpy = jest.spyOn(TfmFacilitiesRepo, 'findOneByUkefFacilityId');
    const facilityId = '12345678';

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('when a facility is not found', () => {
      beforeEach(() => {
        findOneByUkefFacilityIdSpy.mockResolvedValue(null);
      });

      it('should throw an error', async () => {
        await expect(calculateInitialUtilisationAndFixedFee(facilityId)).rejects.toThrow(new Error(`TFM facility ${facilityId} could not be found`));
      });
    });

    describe('when a facility does not contain a value', () => {
      beforeEach(() => {
        const facility = {
          ...aTfmFacility(),
          facilitySnapshot: {
            ...aTfmFacility().facilitySnapshot,
            value: 0,
          },
        };

        findOneByUkefFacilityIdSpy.mockResolvedValue(facility);
      });

      it('should throw an error', async () => {
        await expect(calculateInitialUtilisationAndFixedFee(facilityId)).rejects.toThrow(new Error(`TFM facility values for ${facilityId} are missing`));
      });
    });

    describe('when a facility exists', () => {
      const facility = aTfmFacility();

      beforeEach(() => {
        findOneByUkefFacilityIdSpy.mockResolvedValue(facility);
      });

      it('should return a value for utilisation and fixed fee', async () => {
        const result = await calculateInitialUtilisationAndFixedFee(facilityId);

        const { value, coverStartDate, coverEndDate, interestPercentage, dayCountBasis } = facility.facilitySnapshot;

        const utilisation = calculateInitialUtilisation(value);
        const expected = {
          fixedFee: calculateFixedFee({
            utilisation,
            coverStartDate: coverStartDate as Date,
            coverEndDate: coverEndDate as Date,
            interestPercentage,
            dayCountBasis,
          }),
          utilisation,
        };

        expect(result).toEqual(expected);
      });
    });
  });
});
