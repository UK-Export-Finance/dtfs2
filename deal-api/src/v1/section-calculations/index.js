const { hasValue } = require('../../utils/string');
const {
  isNumeric,
  decimalsCount,
  roundNumber,
} = require('../../utils/number');

exports.calculateGuaranteeFee = (riskMarginFee) => {
  if (hasValue(riskMarginFee)) {
    const calculation = riskMarginFee * 0.9;
    const formattedRiskMarginFee = calculation.toLocaleString('en', { minimumFractionDigits: 4 });
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

    const formattedUkefExposure = ukefExposure.toLocaleString('en', { minimumFractionDigits: 2 });
    return formattedUkefExposure;
  }
  return '';
};
