import { calculateNewFacilityValue } from './amendments-calculate-new-facility-value';
import { calculateUkefExposure } from './calculate-ukef-exposure';
import { formattedNumber } from './formatted-number';
import { PortalFacilityAmendmentWithUkefId, TfmFacilityAmendmentWithUkefId } from '../types';

/**
 * creates exposure object for an amendment
 * This object contains the exposure value, timestamp, and the raw ukef exposure value.
 * If no value in GBP can be calculated, it returns an empty object.
 * If the ukef exposure cannot be calculated, it also returns an empty object.
 * @param exchangeRate
 * @param coverPercentageValue
 * @param amendment
 * @param ukefExposureTimestamp
 * @returns exposure object or empty object if no value can be calculated
 */
export const createAmendmentFacilityExposure = (
  exchangeRate: number,
  coverPercentageValue: number,
  amendment: PortalFacilityAmendmentWithUkefId | TfmFacilityAmendmentWithUkefId,
  ukefExposureTimestamp: number,
) => {
  const valueInGBP = calculateNewFacilityValue(exchangeRate, amendment);

  if (valueInGBP === null) {
    return {};
  }

  const ukefExposureValue = calculateUkefExposure(valueInGBP, coverPercentageValue);

  if (ukefExposureValue === null) {
    return {};
  }

  // sets new exposure value based on amendment value
  const formattedUkefExposure = formattedNumber(ukefExposureValue);

  // converts from seconds unix timestamp to one with milliseconds
  const ukefExposureCalculationTimestampValue = new Date(ukefExposureTimestamp * 1000).valueOf();

  return {
    exposure: formattedUkefExposure,
    timestamp: ukefExposureCalculationTimestampValue,
    ukefExposureValue,
  };
};
