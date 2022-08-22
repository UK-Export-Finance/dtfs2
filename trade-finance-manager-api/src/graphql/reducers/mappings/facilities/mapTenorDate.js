const CONSTANTS = require('../../../../constants');

const monthString = (period) => {
  if (Number(period) === 1) {
    return 'month';
  }

  return 'months';
};

const mapTenorDate = (
  facilityStage,
  ukefGuaranteeInMonths,
  exposurePeriodInMonths,
) => {
  let period;

  if (exposurePeriodInMonths) {
    period = exposurePeriodInMonths;

    return `${period} ${monthString(period)}`;
  }

  if (!ukefGuaranteeInMonths) {
    return null;
  }

  if (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE.COMMITMENT) {
    period = ukefGuaranteeInMonths;
    return `${period} ${monthString(period)}`;
  }

  if (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE.ISSUED) {
    period = ukefGuaranteeInMonths;

    return `${period} ${monthString(period)}`;
  }

  return null;
};

module.exports = mapTenorDate;
