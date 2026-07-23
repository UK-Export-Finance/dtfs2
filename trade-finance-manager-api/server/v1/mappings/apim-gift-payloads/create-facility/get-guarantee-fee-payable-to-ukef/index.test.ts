import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';
import mapGuaranteeFeePayableToUkef from '../../../../rest-mappings/mappings/facilities/mapGuaranteeFeePayableToUkef';
import { getGuaranteeFeePayableToUkef } from '.';

describe('getGuaranteeFeePayableToUkef', () => {
  describe('when isBssEwcsDeal is true', () => {
    it('should return the "guaranteeFeePayableByBank" value', () => {
      // Arrange
      const facilitySnapshot = {
        guaranteeFeePayableByBank: '1.23',
      } as TfmFacilitySnapshot;

      const params = {
        facilitySnapshot,
        isBssEwcsDeal: true,
        isGefDeal: false,
      };

      // Act
      const result = getGuaranteeFeePayableToUkef(params);

      // Assert
      const expected = mapGuaranteeFeePayableToUkef(facilitySnapshot.guaranteeFeePayableByBank);

      expect(result).toEqual(expected);
    });

    describe('when guaranteeFeePayableByBank is not provided', () => {
      it('should return null', () => {
        // Arrange
        const facilitySnapshot = {} as TfmFacilitySnapshot;

        const params = {
          facilitySnapshot,
          isBssEwcsDeal: true,
          isGefDeal: false,
        };

        // Act
        const result = getGuaranteeFeePayableToUkef(params);

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('when isGefDeal is true', () => {
    it('should return the "guaranteeFee" value', () => {
      // Arrange
      const facilitySnapshot = {
        guaranteeFee: 2.34,
      } as TfmFacilitySnapshot;

      const params = {
        facilitySnapshot,
        isBssEwcsDeal: false,
        isGefDeal: true,
      };

      // Act
      const result = getGuaranteeFeePayableToUkef(params);

      // Assert
      const expected = mapGuaranteeFeePayableToUkef(facilitySnapshot.guaranteeFee);

      expect(result).toEqual(expected);
    });

    describe('when guaranteeFee is not provided', () => {
      it('should return null', () => {
        // Arrange
        const facilitySnapshot = {} as TfmFacilitySnapshot;

        const params = {
          facilitySnapshot,
          isBssEwcsDeal: false,
          isGefDeal: true,
        };

        // Act
        const result = getGuaranteeFeePayableToUkef(params);

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('when isBssEwcsDeal and isGefDeal are false', () => {
    it('should return null', () => {
      // Arrange
      const params = {
        facilitySnapshot: {} as TfmFacilitySnapshot,
        isBssEwcsDeal: false,
        isGefDeal: false,
      };

      // Act
      const result = getGuaranteeFeePayableToUkef(params);

      // Assert
      expect(result).toBeNull();
    });
  });
});
