import type { Currency } from '@ukef/dtfs2-common';
import { CURRENCY } from '@ukef/dtfs2-common';
import { ACCRUAL_FREQUENCY_CODE_MAP, ACCRUAL_SCHEDULE_INDEX_RATE_CODES } from '../../../constants';
import { mapEwcsIndexRateCode } from '.';

const { QUARTERLY } = ACCRUAL_FREQUENCY_CODE_MAP;
const { EUR, GBP, JPY, USD, UNKNOWN } = ACCRUAL_SCHEDULE_INDEX_RATE_CODES;

describe('mapEwcsIndexRateCode', () => {
  describe(`when currency is ${CURRENCY.EUR}`, () => {
    it(`should return ${EUR.QUARTERLY} when frequencyCode is ${QUARTERLY}`, () => {
      // Arrange & Act
      const result = mapEwcsIndexRateCode({
        currency: CURRENCY.EUR,
        frequencyCode: QUARTERLY,
      });

      // Assert
      expect(result).toEqual(EUR.QUARTERLY);
    });

    it(`should return ${EUR.OTHER} when frequencyCode is not ${EUR.QUARTERLY}`, () => {
      // Arrange & Act
      const result = mapEwcsIndexRateCode({
        currency: CURRENCY.EUR,
        frequencyCode: 'UNRECOGNISED',
      });

      // Assert
      expect(result).toEqual(EUR.OTHER);
    });
  });

  describe(`when currency is ${CURRENCY.GBP}`, () => {
    it(`should return ${GBP.QUARTERLY} when frequencyCode is ${QUARTERLY}`, () => {
      // Arrange & Act
      const result = mapEwcsIndexRateCode({
        currency: CURRENCY.GBP,
        frequencyCode: QUARTERLY,
      });

      // Assert
      expect(result).toEqual(GBP.QUARTERLY);
    });

    it(`should return ${GBP.OTHER} when frequencyCode is not ${GBP.QUARTERLY}`, () => {
      // Arrange & Act
      const result = mapEwcsIndexRateCode({
        currency: CURRENCY.GBP,
        frequencyCode: 'UNRECOGNISED',
      });

      // Assert
      expect(result).toEqual(GBP.OTHER);
    });
  });

  describe(`when currency is ${CURRENCY.JPY}`, () => {
    it(`should return ${JPY.QUARTERLY} when frequencyCode is ${QUARTERLY}`, () => {
      // Arrange & Act
      const result = mapEwcsIndexRateCode({
        currency: CURRENCY.JPY,
        frequencyCode: QUARTERLY,
      });

      // Assert
      expect(result).toEqual(JPY.QUARTERLY);
    });

    it(`should return ${JPY.OTHER} when frequencyCode is not ${JPY.QUARTERLY}`, () => {
      // Arrange & Act
      const result = mapEwcsIndexRateCode({
        currency: CURRENCY.JPY,
        frequencyCode: 'UNRECOGNISED',
      });

      // Assert
      expect(result).toEqual(JPY.OTHER);
    });
  });

  describe(`when currency is ${CURRENCY.USD}`, () => {
    it(`should return ${USD.QUARTERLY} when frequencyCode is ${QUARTERLY}`, () => {
      // Arrange & Act
      const result = mapEwcsIndexRateCode({
        currency: CURRENCY.USD,
        frequencyCode: QUARTERLY,
      });

      // Assert
      expect(result).toEqual(USD.QUARTERLY);
    });

    it(`should return ${USD.OTHER} when frequencyCode is not ${USD.QUARTERLY}`, () => {
      // Arrange & Act
      const result = mapEwcsIndexRateCode({
        currency: CURRENCY.USD,
        frequencyCode: 'UNRECOGNISED',
      });

      // Assert
      expect(result).toEqual(USD.OTHER);
    });
  });

  describe('when currency is not recognised', () => {
    const currency = 'UNRECOGNISED' as Currency;

    it(`should return ${UNKNOWN} when frequencyCode is ${QUARTERLY}`, () => {
      // Arrange & Act
      const result = mapEwcsIndexRateCode({
        currency,
        frequencyCode: QUARTERLY,
      });

      // Assert
      expect(result).toEqual(UNKNOWN);
    });
  });
});
