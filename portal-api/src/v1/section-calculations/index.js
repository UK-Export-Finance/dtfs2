const { hasValue } = require('../../utils/string.util');
const {
  isNumeric,
  decimalsCount,
  roundNumber,
  formattedNumber,
} = require('../../utils/number.util');

exports.calculateGuaranteeFee = (riskMarginFee) => {
  if (hasValue(riskMarginFee)) {
    const calculation = riskMarginFee * 0.9;
    const formattedRiskMarginFee = formattedNumber(calculation, 4);
    return formattedRiskMarginFee;
  }
  return riskMarginFee;
};

exports.calculateUkefExposure = (value, coveredPercentage) => {
  let facilityValue = value;

  const hasFacilityValue = (hasValue(facilityValue));
  const hasCoveredPercentage = (hasValue(coveredPercentage) && isNumeric(Number(coveredPercentage)));
  const canCalculate = (hasFacilityValue && hasCoveredPercentage);

  if (canCalculate) {
    let ukefExposure;

    facilityValue = facilityValue.replace(/,/g, '');
    const calculation = facilityValue * (coveredPercentage / 100);
    const totalDecimals = decimalsCount(calculation);

    if (totalDecimals > 2) {
      ukefExposure = roundNumber(calculation, 2);
    } else {
      ukefExposure = calculation;
    }

    const formattedUkefExposure = formattedNumber(ukefExposure, 2);
    return formattedUkefExposure;
  }
  return '';
};
