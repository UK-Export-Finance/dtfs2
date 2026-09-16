import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';
import mapGuaranteeFeePayableToUkef from '../../../../rest-mappings/mappings/facilities/mapGuaranteeFeePayableToUkef';
import { getGuaranteeFeePayableToUkef } from '.';

describe('getGuaranteeFeePayableToUkef', () => {
  // Arrange
  const baseParams = {
    isBssFacility: false,
    isCashFacility: false,
    isContingentFacility: false,
    isEwcsFacility: false,
  };

  const populatedFacilitySnapshot = {
    guaranteeFeePayableByBank: '1.23',
    guaranteeFee: '4.56',
  } as unknown as TfmFacilitySnapshot;

  describe.each([{ flag: 'isBssFacility' }, { flag: 'isEwcsFacility' }])('when $flag is true', ({ flag }) => {
    it('should return the guaranteeFeePayableByBank value', () => {
      // Arrange
      const params = {
        ...baseParams,
        facilitySnapshot: populatedFacilitySnapshot,
        [flag]: true,
      };

      // Act
      const result = getGuaranteeFeePayableToUkef(params);

      // Assert
      const expected = mapGuaranteeFeePayableToUkef(params.facilitySnapshot.guaranteeFeePayableByBank);

      expect(result).toEqual(expected);
    });

    describe('when guaranteeFeePayableByBank is not provided', () => {
      it('should return null', () => {
        // Arrange
        const params = {
          ...baseParams,
          facilitySnapshot: {} as TfmFacilitySnapshot,
          [flag]: true,
        };

        // Act
        const result = getGuaranteeFeePayableToUkef(params);

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe.each([{ flag: 'isCashFacility' }, { flag: 'isContingentFacility' }])('when $flag is true', ({ flag }) => {
    it('should return the guaranteeFee value', () => {
      // Arrange
      const params = {
        ...baseParams,
        facilitySnapshot: populatedFacilitySnapshot,
        [flag]: true,
      };

      // Act
      const result = getGuaranteeFeePayableToUkef(params);

      // Assert
      const expected = mapGuaranteeFeePayableToUkef(params.facilitySnapshot.guaranteeFee);

      expect(result).toEqual(expected);
    });

    describe('when guaranteeFee is not provided', () => {
      it('should return null', () => {
        // Arrange
        const params = {
          ...baseParams,
          facilitySnapshot: {} as TfmFacilitySnapshot,
          [flag]: true,
        };

        // Act
        const result = getGuaranteeFeePayableToUkef(params);

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('when all flags are false', () => {
    it('should return null', () => {
      // Arrange
      const params = {
        ...baseParams,
        facilitySnapshot: {} as TfmFacilitySnapshot,
      };

      // Act
      const result = getGuaranteeFeePayableToUkef(params);

      // Assert
      expect(result).toBeNull();
    });
  });
});
