import { ObjectId } from 'mongodb';
import { CURRENCY } from '../constants';
import { getGBPValue } from './amendments-get-gbp-value';
import { aPortalFacilityAmendment } from '../test-helpers/mock-data-backend';
import { PortalFacilityAmendmentWithUkefId } from '../types';

describe('getGBPValue()', () => {
  const amendment = {
    ...aPortalFacilityAmendment(),
    amendmentId: new ObjectId().toString(),
    facilityId: new ObjectId().toString(),
    dealId: new ObjectId().toString(),
    currency: CURRENCY.GBP,
  } as PortalFacilityAmendmentWithUkefId;

  it('should return a number if different currency', () => {
    // Arrange
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = 7.1;

    // Act
    const result = getGBPValue(exchangeRate, amendment);

    // Assert
    const expected = amendment.value * exchangeRate;
    expect(result).toEqual(expected);
  });

  it('should return null if no exchange rate if currency not GBP', () => {
    // Arrange
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = null;

    // Act
    // @ts-ignore - testing if exchange rate doesn't exist - js files can call this function
    const result = getGBPValue(exchangeRate, amendment);

    // Assert
    expect(result).toBeNull();
  });
});
