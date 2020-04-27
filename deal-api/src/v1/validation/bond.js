exports.getBondErrors = (bond) => {
  const {
    bondType,
    bondStage,
    bondValue,
    transactionCurrencySameAsSupplyContractCurrency,
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

  if (!bondValue) {
    errorList.bondValue = {
      order: '3',
      text: 'Bond value is required',
    };
  }

  if (!transactionCurrencySameAsSupplyContractCurrency) {
    errorList.transactionCurrencySameAsSupplyContractCurrency = {
      order: '4',
      text: 'Is the currency for this Transaction the same as your Supply Contract currency? is required',
    };
  }

  // todo: add 'currency is the same'

  if (!riskMarginFee) {
    errorList.riskMarginFee = {
      order: '5',
      text: 'Risk Margin Fee is required',
    };
  }

  if (!coveredPercentage) {
    errorList.coveredPercentage = {
      order: '6',
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
      order: '7',
      text: 'Fee type is required',
    };
  }

  if (!feeFrequency) {
    errorList.feeFrequency = {
      order: '8',
      text: 'Fee frequency is required',
    };
  }

  if (!dayCountBasis) {
    errorList.dayCountBasis = {
      order: '9',
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
