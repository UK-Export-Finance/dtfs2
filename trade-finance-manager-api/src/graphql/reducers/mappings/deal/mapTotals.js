const { formattedNumber } = require('../../../../utils/number');
const { calculateNewFacilityValue, calculateAmendmentTotalExposure, isValidCompletedValueAmendment } = require('../../../helpers/amendment.helpers');
const api = require('../../../../v1/api');
const { CURRENCY } = require('../../../../constants/currency.constant');

const mapTotals = async (facilities) => {
  const totals = {};

  // total value of all facilities
  const facilitiesValue = await Promise.all(facilities.map(async (facility) => {
    const { facilitySnapshot, tfm, _id } = facility;

    const latestCompletedAmendment = await api.getLatestCompletedAmendment(_id);

    // if latest amendment then returns value of new amendment
    if (isValidCompletedValueAmendment(latestCompletedAmendment)) {
      const { exchangeRate } = tfm;

      const valueInGBP = calculateNewFacilityValue(exchangeRate, latestCompletedAmendment);
      return Number(valueInGBP);
    }

    if (tfm.facilityValueInGBP) {
      return Number(tfm.facilityValueInGBP);
    }

    // NOTE:
    // Facilities passed into this function are in their raw form (unmapped).
    // If we pass in mapped facilities, value would contain currency code. Therefore:
    // - Bond and Loan facility total is `value`
    // - Cash and Contingent facility total is `value`

    return Number(facilitySnapshot.value);
  }));

  const formattedFacilitiesValue = formattedNumber(facilitiesValue.reduce((a, b) => a + b));

  totals.facilitiesValueInGBP = `${CURRENCY.GBP} ${formattedFacilitiesValue}`;

  // maps through facility and returns promise with exposure array
  let mappedExposureTotal = facilities.map(async (f) => {
    // if amendment completed, then returns exposure value of amendment
    if (await calculateAmendmentTotalExposure(f)) {
      const amendmentExposureValue = await calculateAmendmentTotalExposure(f);
      return amendmentExposureValue;
    }

    if (f.tfm.ukefExposure) {
      return f.tfm.ukefExposure;
    }

    return null;
  });
  // resolves mapped exposure promise
  mappedExposureTotal = await Promise.all(mappedExposureTotal);

  // total ukef exposure for all facilities
  const ukefExposureArray = [...mappedExposureTotal];

  const formattedUkefExposure = formattedNumber(ukefExposureArray.reduce((a, b) => a + b));
  totals.facilitiesUkefExposure = `${CURRENCY.GBP} ${formattedUkefExposure}`;

  return totals;
};

module.exports = mapTotals;
