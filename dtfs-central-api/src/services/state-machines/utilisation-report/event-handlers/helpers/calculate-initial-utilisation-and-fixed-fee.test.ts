import * as dtfsCommon from '@ukef/dtfs2-common';
import { calculateInitialUtilisationAndFixedFee, parseDate, hasRequiredValues, RequiredParams } from './calculate-initial-utilisation-and-fixed-fee';
import { NotFoundError } from '../../../../../errors';
import { aTfmFacility } from '../../../../../../test-helpers';
import * as helpers from '../../../../../helpers';

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

    it('should return false if the coverPercentage is not provided', () => {
      const result = hasRequiredValues({ ...baseParams, coverPercentage: null });
      expect(result).toEqual(false);
    });
  });

  describe('calculateInitialUtilisationAndFixedFee', () => {
    const getKeyingSheetCalculationFacilityValuesSpy = jest.spyOn(helpers, 'getKeyingSheetCalculationFacilityValues');
    const facilityId = '12345678';
    const { facilitySnapshot } = aTfmFacility();

    const keyingSheetCalculationFacilityValues = {
      coverPercentage: facilitySnapshot.coverPercentage,
      value: facilitySnapshot.value,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('when a facility is not found', () => {
      const errorMessage = `TFM facility ${facilityId} could not be found`;
      beforeEach(() => {
        getKeyingSheetCalculationFacilityValuesSpy.mockRejectedValue(new NotFoundError(errorMessage));
      });

      it('should throw an error', async () => {
        await expect(calculateInitialUtilisationAndFixedFee(facilityId)).rejects.toThrow(new Error(errorMessage));
      });
    });

    describe('when a facility does not contain a value', () => {
      beforeEach(() => {
        const values = {
          ...keyingSheetCalculationFacilityValues,
          value: 0,
        };

        getKeyingSheetCalculationFacilityValuesSpy.mockResolvedValue(values);
      });

      it('should throw an error', async () => {
        await expect(calculateInitialUtilisationAndFixedFee(facilityId)).rejects.toThrow(new Error(`TFM facility values for ${facilityId} are missing`));
      });
    });

    describe('when a facility exists', () => {
      const drawnAmount = 12345.678;

      beforeEach(() => {
        getKeyingSheetCalculationFacilityValuesSpy.mockResolvedValue(keyingSheetCalculationFacilityValues);
        jest.mocked(dtfsCommon.calculateDrawnAmount).mockReturnValue(drawnAmount);
      });

      it('should call "getKeyingSheetCalculationFacilityValues" with the facilityId', async () => {
        await calculateInitialUtilisationAndFixedFee(facilityId);

        expect(getKeyingSheetCalculationFacilityValuesSpy).toHaveBeenCalledTimes(1);
        expect(getKeyingSheetCalculationFacilityValuesSpy).toHaveBeenCalledWith(facilityId);
      });

      it('should set initial utilisation to drawn amount rounded to 2 decimal places', async () => {
        // Arrange
        const drawnAmountRoundedToTwoDecimalPlaces = 12345.68;
        const calculateDrawnAmountSpy = jest.spyOn(dtfsCommon, 'calculateDrawnAmount').mockReturnValue(drawnAmount);

        // Act
        const result = await calculateInitialUtilisationAndFixedFee(facilityId);

        // Assert
        expect(calculateDrawnAmountSpy).toHaveBeenCalledWith(keyingSheetCalculationFacilityValues.value, keyingSheetCalculationFacilityValues.coverPercentage);
        expect(result.utilisation).toEqual(drawnAmountRoundedToTwoDecimalPlaces);
      });

      it('should return the initial fixed fee as 0', async () => {
        // Act
        const result = await calculateInitialUtilisationAndFixedFee(facilityId);

        // Assert
        expect(result.fixedFee).toEqual(0);
      });
    });
  });
});
