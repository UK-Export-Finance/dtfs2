const { formattedNumber } = require('../../../../utils/number');

const mapTotals = (facilities) => {
  const totals = {};

  // total value of all facilities
  const facilitiesValue = facilities.map((facility) => {
    const { facilitySnapshot, tfm } = facility;

    if (tfm.valueInGBP) {
      return Number(tfm.valueInGBP);
    }

    // NOTE:
    // Facilities passed into this function are in their raw form (unmapped).
    // If we pass in mapped facilities, value would contain currency code. Therefore:
    // - Bond and Loan facility total is `value`
    // - Cash and Contingent facility total is `value`

    return Number(facilitySnapshot.value);
  });

  const formattedFacilitiesValue = formattedNumber(facilitiesValue.reduce((a, b) => a + b));

  totals.facilitiesValueInGBP = `GBP ${formattedFacilitiesValue}`;

  // total ukef exposure for all facilities
  const ukefExposureArray = [
    ...facilities.map((f) => {
      if (f.tfm.ukefExposure) {
        return f.tfm.ukefExposure;
      }

      return null;
    }),
  ];

  const formattedUkefExposure = formattedNumber(ukefExposureArray.reduce((a, b) => a + b));
  totals.facilitiesUkefExposure = `GBP ${formattedUkefExposure}`;

  return totals;
};

module.exports = mapTotals;
