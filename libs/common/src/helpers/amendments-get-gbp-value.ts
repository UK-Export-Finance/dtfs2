import { PortalFacilityAmendmentWithUkefId, TfmFacilityAmendmentWithUkefId } from '../types';
import { CURRENCY } from '../constants/currency';
import { roundValue } from './round-value';

/**
 * calculates new facility value in GBP
 * if the currency is GBP, it returns the value as is
 * if the currency is not GBP, it converts the value to GBP using the provided exchange rate
 * if the exchange rate is not provided, it returns null
 * @param exchangeRate
 * @param amendment
 * @returns facility value as a number or null if no value can be calculated
 */
export const getGBPValue = (exchangeRate: number, amendment: PortalFacilityAmendmentWithUkefId | TfmFacilityAmendmentWithUkefId): number | null => {
  const { currency, value: amendmentValue } = amendment;

  if (!amendmentValue) {
    return null;
  }

  const isGbp = currency === CURRENCY.GBP;

  // if already in GBP, just take the value
  if (isGbp) {
    return amendmentValue;
  }

  // if no exchange rate return null
  if (!exchangeRate) {
    return null;
  }

  const valueInGBP = amendmentValue * exchangeRate;

  return roundValue(valueInGBP);
};
