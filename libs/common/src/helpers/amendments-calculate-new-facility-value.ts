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
 * @returns facility value as a string or null if no value can be calculated
 */
export const calculateNewFacilityValue = (
  exchangeRate: number,
  amendment: PortalFacilityAmendmentWithUkefId | TfmFacilityAmendmentWithUkefId,
): string | null => {
  const { currency, value: amendmentValue } = amendment;
  let newValue;

  if (currency && amendmentValue) {
    // if already in GBP, just take the value
    if (currency === CURRENCY.GBP) {
      newValue = amendmentValue;
    } else {
      // if no exchange rate return null
      if (!exchangeRate) {
        return null;
      }
      const valueInGBP = amendmentValue * exchangeRate;
      newValue = roundValue(valueInGBP);
    }

    return String(newValue);
  }

  return null;
};
