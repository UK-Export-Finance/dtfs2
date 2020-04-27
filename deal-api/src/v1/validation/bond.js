exports.getBondErrors = (bond) => {
  const {
    bondType,
    bondStage,
    riskMarginFee,
    coveredPercentage,
    feeType,
    feeFrequency,
    dayCountBasis,
  } = bond;

  const errorList = {};

  /* ************************************
  // details
  ***************************************
  */

  if (!bondType) {
    errorList.bondType = {
      order: '1',
      text: 'Bond type is required',
    };
  }

  if (!bondStage) {
    errorList.bondStage = {
      order: '2',
      text: 'Bond stage is required',
    };
  }

  // if unissued
  // ukefGuaranteeInMonths

  // if issued
  // coverEndDate
  // uniqueIdentificationNumber


  /* ************************************
  // financial details
  ***************************************
  */
  if (!riskMarginFee) {
    errorList.riskMarginFee = {
      order: '3',
      text: 'Risk Margin Fee is required',
    };
  }

  if (!coveredPercentage) {
    errorList.coveredPercentage = {
      order: '4',
      text: 'Covered Percentage is required',
    };
  }
  // if currency NOT the same
  // currency
  // conversionRate
  // conversionRateDate


  /* ************************************
  // fee details
  ***************************************
  */
  if (!feeType) {
    errorList.feeType = {
      order: '5',
      text: 'Fee type is required',
    };
  }

  if (!feeFrequency) {
    errorList.feeFrequency = {
      order: '6',
      text: 'Fee frequency is required',
    };
  }

  if (!dayCountBasis) {
    errorList.dayCountBasis = {
      order: '7',
      text: 'Day count basis is required',
    };
  }

  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return false;
  }

  return {
    count: totalErrors,
    errorList,
  };
};
