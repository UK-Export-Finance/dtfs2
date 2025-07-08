import { ObjectId } from 'mongodb';
import { createAmendmentFacilityExposure } from './create-amendment-facility-exposure';
import { getGBPValue } from './amendments-get-gbp-value';
import { calculateUkefExposure } from './calculate-ukef-exposure';
import { formattedNumber } from './formatted-number';
import { aPortalFacilityAmendment } from '../test-helpers/mock-data-backend';
import { PortalFacilityAmendmentWithUkefId } from '../types';

describe('createAmendmentFacilityExposure()', () => {
  const amendment = {
    ...aPortalFacilityAmendment(),
    amendmentId: new ObjectId().toString(),
    facilityId: new ObjectId().toString(),
    dealId: new ObjectId().toString(),
  } as PortalFacilityAmendmentWithUkefId;

  const exchangeRate = 0.5;
  const coverPercentageValue = 100;

  describe('when getGBPValue returns null', () => {
    it('should return an empty object', () => {
      // Arrange
      const amendmentNoValue = {
        ...amendment,
        value: null,
      };

      // Act
      const result = createAmendmentFacilityExposure(exchangeRate, coverPercentageValue, amendmentNoValue, Date.now());

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('when calculateUkefExposure returns null', () => {
    it('should return an empty object', () => {
      // Arrange
      const coverPercentageValueNoCover = 0;

      // Act
      const result = createAmendmentFacilityExposure(exchangeRate, coverPercentageValueNoCover, amendment, Date.now());

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('when both values are valid', () => {
    it('should return the formatted exposure and timestamp', () => {
      // Arrange
      const timestamp = Date.now();

      // Act
      const result = createAmendmentFacilityExposure(exchangeRate, coverPercentageValue, amendment, timestamp);

      // Assert
      const valueInGBP = getGBPValue(exchangeRate, amendment);
      const ukefExposureValue = calculateUkefExposure(valueInGBP!, coverPercentageValue);
      const formattedUkefExposure = formattedNumber(ukefExposureValue!);
      const ukefExposureCalculationTimestampValue = new Date(timestamp * 1000).valueOf();

      const expected = {
        exposure: formattedUkefExposure,
        timestamp: ukefExposureCalculationTimestampValue,
        ukefExposureValue,
      };

      expect(result).toEqual(expected);
    });
  });
});
