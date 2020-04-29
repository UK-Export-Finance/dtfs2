const { orderNumber } = require('../../utils/error-list-order-number');

exports.getBondErrors = (bond) => {
  const {
    bondType,
    bondStage,
    ukefGuaranteeInMonths,
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
    uniqueIdentificationNumber,
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
      order: orderNumber(errorList),
      text: 'Bond type is required',
    };
  }

  if (!bondStage) {
    errorList.bondStage = {
      order: orderNumber(errorList),
      text: 'Bond stage is required',
    };
  }

  if (bondStage === 'Unissued') {
    if (!ukefGuaranteeInMonths) {
      errorList.ukefGuaranteeInMonths = {
        order: orderNumber(errorList),
        text: 'Length of time that the UKEF\'s guarantee will be in place for is required',
      };
    }
  }

  if (bondStage === 'Issued') {
    if (!coverEndDateDay && !coverEndDateMonth && !coverEndDateYear) {
      errorList.coverEndDate = {
        order: orderNumber(errorList),
        text: 'Cover End Date is required',
      };
    } else if (!coverEndDateDay) {
      errorList['coverEndDate-day'] = {
        order: orderNumber(errorList),
        text: 'Cover End Date must include a day',
      };
    } else if (!coverEndDateMonth) {
      errorList['coverEndDate-month'] = {
        order: orderNumber(errorList),
        text: 'Cover End Date must include a month',
      };
    } else if (!coverEndDateYear) {
      errorList['coverEndDate-year'] = {
        order: orderNumber(errorList),
        text: 'Cover End Date must include a year',
      };
    }

    if (!uniqueIdentificationNumber) {
      errorList.uniqueIdentificationNumber = {
        order: orderNumber(errorList),
        text: 'Bond\'s unique identification number is required',
      };
    }
  }


  /* ************************************
  // financial details
  ***************************************
  */

  if (!bondValue) {
    errorList.bondValue = {
      order: orderNumber(errorList),
      text: 'Bond value is required',
    };
  }

  if (!transactionCurrencySameAsSupplyContractCurrency) {
    errorList.transactionCurrencySameAsSupplyContractCurrency = {
      order: orderNumber(errorList),
      text: 'Is the currency for this Transaction the same as your Supply Contract currency? is required',
    };
  }

  if (!riskMarginFee) {
    errorList.riskMarginFee = {
      order: orderNumber(errorList),
      text: 'Risk Margin Fee is required',
    };
  }

  if (!coveredPercentage) {
    errorList.coveredPercentage = {
      order: orderNumber(errorList),
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
      order: orderNumber(errorList),
      text: 'Fee type is required',
    };
  }

  if (!feeFrequency) {
    errorList.feeFrequency = {
      order: orderNumber(errorList),
      text: 'Fee frequency is required',
    };
  }

  if (!dayCountBasis) {
    errorList.dayCountBasis = {
      order: orderNumber(errorList),
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
