import { getGBPValue } from './amendments-get-gbp-value';
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
  const valueInGBP = getGBPValue(exchangeRate, amendment);

  if (!valueInGBP) {
    return {};
  }

  const ukefExposureValue = calculateUkefExposure(valueInGBP, coverPercentageValue);

  if (!ukefExposureValue) {
    return {};
  }

  // sets new exposure value based on amendment value
  const exposure = formattedNumber(ukefExposureValue);

  // converts from seconds unix timestamp to one with milliseconds
  const timestampHasSecondsOnly = ukefExposureTimestamp.toString().length === 10;
  let ukefExposureTimestampValue = ukefExposureTimestamp;

  if (timestampHasSecondsOnly) {
    ukefExposureTimestampValue *= 1000;
  }

  const timestamp = new Date(ukefExposureTimestampValue).valueOf();

  return {
    exposure,
    timestamp,
    ukefExposureValue,
  };
};
