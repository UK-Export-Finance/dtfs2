import { ObjectId } from 'mongodb';
import { CURRENCY } from '../constants';
import { calculateNewFacilityValue } from './amendments-calculate-new-facility-value';
import { aPortalFacilityAmendment } from '../test-helpers/mock-data-backend';
import { PortalFacilityAmendmentWithUkefId } from '../types';

describe('calculateNewFacilityValue()', () => {
  const amendment = {
    ...aPortalFacilityAmendment(),
    amendmentId: new ObjectId().toString(),
    facilityId: new ObjectId().toString(),
    dealId: new ObjectId().toString(),
    currency: CURRENCY.GBP,
  } as PortalFacilityAmendmentWithUkefId;

  it('should return a number if different currency', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = 7.1;

    const result = calculateNewFacilityValue(exchangeRate, amendment);
    const expected = String(amendment.value * exchangeRate);
    expect(result).toEqual(expected);
  });

  it('should return null if no exchange rate if currency not GBP', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = null;

    // @ts-ignore - testing if exchange rate doesn't exist - js files can call this function
    const result = calculateNewFacilityValue(exchangeRate, amendment);
    expect(result).toBeNull();
  });
});
