import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';
import mapGuaranteeFeePayableToUkef from '../../../../rest-mappings/mappings/facilities/mapGuaranteeFeePayableToUkef';
import { getGuaranteeFeePayableToUkef } from '.';

describe('getGuaranteeFeePayableToUkef', () => {
  describe('when isBssEwcsDeal is true', () => {
    it('should return the mapped "guarantee fee payable by bank" value from the "guaranteeFeePayableByBank" value', () => {
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
  });

  describe('when isGefDeal is true', () => {
    it('should return the mapped "guarantee fee payable by bank" value from the "guaranteeFee" value', () => {
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
