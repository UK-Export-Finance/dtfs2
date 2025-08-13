const { CURRENCY, formattedNumber, getGBPValue } = require('@ukef/dtfs2-common');
const { calculateAmendmentTotalExposure, findLatestCompletedAmendment } = require('../../helpers/amendment.helpers');
const isValidFacility = require('../../helpers/isValidFacility.helper');

const mapTotals = (facilities) => {
  const totals = {};

  // total value of all facilities
  const facilitiesValue = !facilities
    ? null
    : facilities.map((facility) => {
        if (isValidFacility(facility)) {
          const { facilitySnapshot, tfm } = facility;

          // if latest amendment then returns value of new amendment
          if (facility?.amendments?.length) {
            const { exchangeRate } = tfm;
            const { value: latestAmendmentValue } = findLatestCompletedAmendment(facility.amendments);

            if (latestAmendmentValue) {
              const valueInGBP = getGBPValue(exchangeRate, latestAmendmentValue);
              return Number(valueInGBP);
            }
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
        }
        return null;
      });

  const formattedFacilitiesValue = facilitiesValue.length ? formattedNumber(facilitiesValue.reduce((a, b) => a + b)) : 0;

  totals.facilitiesValueInGBP = `${CURRENCY.GBP} ${formattedFacilitiesValue}`;

  // maps through facility and returns total from exposure array
  const mappedExposureTotal = !facilities
    ? null
    : facilities.map((f) => {
        // if amendment completed, then returns exposure value of amendment
        if (calculateAmendmentTotalExposure(f)) {
          const amendmentExposureValue = calculateAmendmentTotalExposure(f);
          return amendmentExposureValue;
        }

        if (f.tfm.ukefExposure) {
          return f.tfm.ukefExposure;
        }

        return null;
      });

  // total ukef exposure for all facilities
  const ukefExposureArray = [...mappedExposureTotal];

  const formattedUkefExposure = ukefExposureArray.length ? formattedNumber(ukefExposureArray.reduce((a, b) => a + b)) : 0;

  totals.facilitiesUkefExposure = `${CURRENCY.GBP} ${formattedUkefExposure}`;

  return totals;
};

module.exports = mapTotals;
