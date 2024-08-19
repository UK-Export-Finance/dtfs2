const CONSTANTS = require('../../../constants');
const { to2Decimals } = require('../../../helpers/currency');

/**
 * `GEF` = 10% of amount
 * `Loan` (EWCS) = Disbursement amount * (UKEF cover percentage / 100)
 * `Bond` (BSS) = Amount
 * @param {Float} amount Facility UKEF exposure
 * @param {object} facility Facility
 * @param {object} dealType Deal type
 */
const getLoanMaximumLiability = (amount, facility, dealType) => {
  let ukefExposure;

  // GEF
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    ukefExposure = amount * 0.1;
  } else {
    let { disbursementAmount, coveredPercentage } = facility.facilitySnapshot;
    const { coverPercentage } = facility.facilitySnapshot;

    if (disbursementAmount && typeof disbursementAmount === 'string') {
      disbursementAmount = disbursementAmount.replace(/,/g, '');
    }

    if (coveredPercentage && typeof coveredPercentage === 'string') {
      coveredPercentage = coveredPercentage.replace(/,/g, '');
    }

    if (coverPercentage && !coveredPercentage) {
      coveredPercentage = coverPercentage;
    }

    // BSS/EWCS
    ukefExposure =
      facility.facilitySnapshot.type === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN
        ? disbursementAmount * (coveredPercentage / 100) // EWCS
        : amount; // BSS
  }

  return to2Decimals(ukefExposure);
};

module.exports = getLoanMaximumLiability;
