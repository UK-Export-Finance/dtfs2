import { calculateInitialUtilisation } from '@ukef/dtfs2-common';
import { calculateInitialUtilisationAndFixedFee, parseDate, hasRequiredValues, RequiredParams } from './calculate-initial-utilisation-and-fixed-fee';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { aTfmFacility } from '../../../../../../test-helpers';
import { calculateInitialFixedFee } from './calculate-initial-fixed-fee';

describe('helpers/calculate-initial-utilisation-and-fixed-fee', () => {
  describe('parseDate', () => {
    describe('date passed as null', () => {
      it('should return an error', () => {
        expect(() => parseDate(null)).toThrow('Invalid date');
      });
    });

    describe('date passed in a correct format', () => {
      it('should return the formatted date', () => {
        const date = new Date();

        const result = parseDate(date);

        expect(result).toEqual(date);
      });
    });

    describe('date passed as a string', () => {
      it('should return the formatted date', () => {
        const date = new Date().toString();

        const result = parseDate(date);
        const expected = new Date(date);

        expect(result).toEqual(expected);
      });
    });

    describe('date passed in EPOCH', () => {
      it('should return the formatted date', () => {
        const date = new Date().getTime();

        const result = parseDate(date);
        const expected = new Date(date);

        expect(result).toEqual(expected);
      });
    });
  });

  describe('hasRequiredValues', () => {
    const baseParams = {
      value: 1,
      interestPercentage: 2,
      dayCountBasis: 3,
      coverStartDate: new Date(),
      coverEndDate: new Date(),
    } as RequiredParams;

    it('should return true if all values are present', () => {
      const result = hasRequiredValues(baseParams);
      expect(result).toEqual(true);
    });

    it('should return false if the value is not provided', () => {
      baseParams.value = null;

      const result = hasRequiredValues(baseParams);
      expect(result).toEqual(false);
    });

    it('should return false if the interestPercentage is not provided', () => {
      baseParams.interestPercentage = null;

      const result = hasRequiredValues(baseParams);
      expect(result).toEqual(false);
    });

    it('should return false if the dayCountBasis is not provided', () => {
      baseParams.dayCountBasis = null;

      const result = hasRequiredValues(baseParams);
      expect(result).toEqual(false);
    });

    it('should return false if the coverEndDate is not provided', () => {
      baseParams.coverEndDate = null;

      const result = hasRequiredValues(baseParams);
      expect(result).toEqual(false);
    });

    it('should return false if the coverStartDate is not provided', () => {
      baseParams.coverStartDate = null;

      const result = hasRequiredValues(baseParams);
      expect(result).toEqual(false);
    });

    it('should return false if the coverStartDate is the wrong format', () => {
      baseParams.coverStartDate = 'a';

      const result = hasRequiredValues(baseParams);
      expect(result).toEqual(false);
    });

    it('should return false if the coverEndDate is the wrong format', () => {
      baseParams.coverEndDate = 'a';

      const result = hasRequiredValues(baseParams);
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
          fixedFee: calculateInitialFixedFee({
            utilisation,
            coverStartDate: parseDate(coverStartDate),
            coverEndDate: parseDate(coverEndDate),
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
