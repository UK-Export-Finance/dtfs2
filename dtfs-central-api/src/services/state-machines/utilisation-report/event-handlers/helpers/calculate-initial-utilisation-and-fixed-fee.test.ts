import * as dtfsCommon from '@ukef/dtfs2-common';
import { calculateInitialUtilisationAndFixedFee, parseDate, hasRequiredValues, RequiredParams } from './calculate-initial-utilisation-and-fixed-fee';
import { NotFoundError } from '../../../../../errors';
import { aTfmFacility } from '../../../../../../test-helpers';
import * as fixedFeeHelpers from './calculate-initial-fixed-fee';
import * as helpers from '../../../../../helpers';

jest.mock('./calculate-initial-fixed-fee');
jest.mock('../../../../../helpers/get-keying-sheet-calculation-tfm-facility-values');

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  calculateDrawnAmount: jest.fn(),
}));

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
      coverPercentage: 4,
    } as RequiredParams;

    it('should return true if all values are present', () => {
      const result = hasRequiredValues(baseParams);
      expect(result).toEqual(true);
    });

    it('should return false if the value is not provided', () => {
      const result = hasRequiredValues({ ...baseParams, value: null });
      expect(result).toEqual(false);
    });

    it('should return false if the interestPercentage is not provided', () => {
      const result = hasRequiredValues({ ...baseParams, interestPercentage: null });
      expect(result).toEqual(false);
    });

    it('should return false if the dayCountBasis is not provided', () => {
      const result = hasRequiredValues({ ...baseParams, dayCountBasis: null });
      expect(result).toEqual(false);
    });

    it('should return false if the coverPercentage is not provided', () => {
      const result = hasRequiredValues({ ...baseParams, coverPercentage: null });
      expect(result).toEqual(false);
    });

    it('should return false if the coverEndDate is not provided', () => {
      const result = hasRequiredValues({ ...baseParams, coverEndDate: null });
      expect(result).toEqual(false);
    });

    it('should return false if the coverStartDate is not provided', () => {
      const result = hasRequiredValues({ ...baseParams, coverStartDate: null });
      expect(result).toEqual(false);
    });

    it('should return false if the coverStartDate is the wrong format', () => {
      const result = hasRequiredValues({ ...baseParams, coverStartDate: 'a' });
      expect(result).toEqual(false);
    });

    it('should return false if the coverEndDate is the wrong format', () => {
      const result = hasRequiredValues({ ...baseParams, coverEndDate: 'a' });
      expect(result).toEqual(false);
    });
  });

  describe('calculateInitialUtilisationAndFixedFee', () => {
    const getKeyingSheetCalculationTfmFacilityValuesSpy = jest.spyOn(helpers, 'getKeyingSheetCalculationTfmFacilityValues');
    const facilityId = '12345678';
    const { facilitySnapshot } = aTfmFacility();

    const keyingSheetCalculationTfmFacilityValues = {
      coverEndDate: new Date(),
      coverStartDate: new Date(),
      dayCountBasis: facilitySnapshot.dayCountBasis,
      interestPercentage: facilitySnapshot.interestPercentage,
      coverPercentage: facilitySnapshot.coverPercentage,
      value: facilitySnapshot.value,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('when a facility is not found', () => {
      const errorMessage = `TFM facility ${facilityId} could not be found`;
      beforeEach(() => {
        getKeyingSheetCalculationTfmFacilityValuesSpy.mockRejectedValue(new NotFoundError(errorMessage));
      });

      it('should throw an error', async () => {
        await expect(calculateInitialUtilisationAndFixedFee(facilityId)).rejects.toThrow(new Error(errorMessage));
      });
    });

    describe('when a facility does not contain a value', () => {
      beforeEach(() => {
        const values = {
          ...keyingSheetCalculationTfmFacilityValues,
          value: 0,
        };

        getKeyingSheetCalculationTfmFacilityValuesSpy.mockResolvedValue(values);
      });

      it('should throw an error', async () => {
        await expect(calculateInitialUtilisationAndFixedFee(facilityId)).rejects.toThrow(new Error(`TFM facility values for ${facilityId} are missing`));
      });
    });

    describe('when a facility exists', () => {
      const drawnAmount = 12345.678;

      beforeEach(() => {
        getKeyingSheetCalculationTfmFacilityValuesSpy.mockResolvedValue(keyingSheetCalculationTfmFacilityValues);
        jest.mocked(fixedFeeHelpers.calculateInitialFixedFee).mockReturnValue(999.99);
        jest.mocked(dtfsCommon.calculateDrawnAmount).mockReturnValue(drawnAmount);
      });

      it('should call "getkeyingSheetCalculationTfmFacilityValues" with the facilityId', async () => {
        await calculateInitialUtilisationAndFixedFee(facilityId);

        expect(getKeyingSheetCalculationTfmFacilityValuesSpy).toHaveBeenCalledTimes(1);
        expect(getKeyingSheetCalculationTfmFacilityValuesSpy).toHaveBeenCalledWith(facilityId);
      });

      it('should set initial utilisation to drawn amount rounded to 2 decimal places', async () => {
        // Arrange
        const drawnAmountRoundedToTwoDecimalPlaces = 12345.68;
        const calculateDrawnAmountSpy = jest.spyOn(dtfsCommon, 'calculateDrawnAmount').mockReturnValue(drawnAmount);

        // Act
        const result = await calculateInitialUtilisationAndFixedFee(facilityId);

        // Assert
        expect(calculateDrawnAmountSpy).toHaveBeenCalledWith(
          keyingSheetCalculationTfmFacilityValues.value,
          keyingSheetCalculationTfmFacilityValues.coverPercentage,
        );
        expect(result.utilisation).toEqual(drawnAmountRoundedToTwoDecimalPlaces);
      });

      it('should calculate and return the initial fixed fee', async () => {
        // Arrange
        const drawnAmountRoundedToTwoDecimalPlaces = 12345.68;
        const calculateInitialFixedFeeSpy = jest.spyOn(fixedFeeHelpers, 'calculateInitialFixedFee').mockReturnValue(999.99);

        // Act
        const result = await calculateInitialUtilisationAndFixedFee(facilityId);

        // Assert
        expect(calculateInitialFixedFeeSpy).toHaveBeenCalledWith({
          ukefShareOfUtilisation: drawnAmountRoundedToTwoDecimalPlaces,
          coverStartDate: keyingSheetCalculationTfmFacilityValues.coverStartDate,
          coverEndDate: keyingSheetCalculationTfmFacilityValues.coverEndDate,
          interestPercentage: keyingSheetCalculationTfmFacilityValues.interestPercentage,
          dayCountBasis: keyingSheetCalculationTfmFacilityValues.dayCountBasis,
        });
        expect(result.fixedFee).toEqual(999.99);
      });
    });
  });
});
