const moment = require('moment');
const { orderNumber } = require('../../utils/error-list-order-number');
const { hasValue } = require('../../utils/string');
const {
  dateHasAllValues,
  dateHasSomeValues,
  dateIsInTimeframe,
  dateValidationText,
} = require('./date-field');
const {
  conversionRateIsValid,
  conversionRateValidationText,
} = require('./bond-rules/conversion-rate');
const {
  coveredPercentageIsValid,
  coveredPercentageValidationText,
} = require('./bond-rules/covered-percentage');
const {
  minimumRiskMarginFeeIsValid,
  minimumRiskMarginFeeValidationText,
} = require('./bond-rules/minimum-risk-margin-fee');
const {
  riskMarginFeeIsValid,
  riskMarginFeeValidationText,
} = require('./bond-rules/risk-margin-fee');

exports.getBondErrors = (bond) => {
  const {
    bondType,
    bondStage,
    ukefGuaranteeInMonths,

    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,

    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
    uniqueIdentificationNumber,
    bondValue,
    transactionCurrencySameAsSupplyContractCurrency,
    currency,
    conversionRate,
    'conversionRateDate-day': conversionRateDateDay,
    'conversionRateDate-month': conversionRateDateMonth,
    'conversionRateDate-year': conversionRateDateYear,
    riskMarginFee,
    coveredPercentage,
    minimumRiskMarginFee,
    feeType,
    feeFrequency,
    dayCountBasis,
  } = bond;

  const errorList = {};

  // conditionalErrorList pattern is:
  /*
  const conditionalErrorList = {
    fieldName: {
      possibleFieldValue: {
        requiredFieldWhenThisValueIsSet: {
          text: 'Enter X Field',
        },
        requiredFieldWhenThisValueIsSet: {
          text: 'Enter Y Field',
        },
      },
      possibleFieldValue: {
        requiredFieldWhenThisValueIsSet: {
          text: 'Enter Z Field ',
        }
      },
    },
  }
  */

  const conditionalErrorList = {
    bondStage: {
      Unissued: {
        ukefGuaranteeInMonths: {
          text: 'Enter the Length of time that the UKEF\'s guarantee will be in place for',
        },
      },
      Issued: {
        coverEndDate: {
          text: 'Enter the Cover End Date',
        },
        uniqueIdentificationNumber: {
          text: 'Enter the Bond\'s unique identification number',
        },
      },
    },
    transactionCurrencySameAsSupplyContractCurrency: {
      false: {
        currency: {
          text: 'Enter the Currency',
        },
        conversionRate: {
          text: 'Enter the Conversion rate to the Supply Contract currency',
        },
        conversionRateDate: {
          text: 'Enter the Conversion rate date',
        },
      },
    },
  };

  /* ************************************
  // details
  ***************************************
  */

  if (!hasValue(bondType)) {
    errorList.bondType = {
      order: orderNumber(errorList),
      text: 'Enter the Bond type',
    };
  }

  if (!hasValue(bondStage)) {
    errorList.bondStage = {
      order: orderNumber(errorList),
      text: 'Enter the Bond stage',
    };
  }

  if (bondStage === 'Unissued') {
    if (!hasValue(ukefGuaranteeInMonths)) {
      errorList.ukefGuaranteeInMonths = {
        order: orderNumber(errorList),
        text: 'Enter the Length of time that the UKEF\'s guarantee will be in place for',
      };
    }
  }

  if (bondStage === 'Issued') {
    if (dateHasAllValues(requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear)) {
      const MAX_MONTHS_FROM_NOW = 3;
      const nowDate = moment();

      if (!dateIsInTimeframe(
        requestedCoverStartDateDay,
        requestedCoverStartDateMonth,
        requestedCoverStartDateYear,
        nowDate,
        moment(nowDate).add(MAX_MONTHS_FROM_NOW, 'months'),
      )) {
        errorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${moment().format('Do MMMM YYYY')} and ${moment(nowDate).add(MAX_MONTHS_FROM_NOW, 'months').format('Do MMMM YYYY')}`,
          order: orderNumber(errorList),
        };
      }
    } else if (dateHasSomeValues(
      requestedCoverStartDateDay,
      requestedCoverStartDateMonth,
      requestedCoverStartDateYear,
    )) {
      errorList.requestedCoverStartDate = {
        text: dateValidationText(
          'Requested Cover Start Date',
          requestedCoverStartDateDay,
          requestedCoverStartDateMonth,
          requestedCoverStartDateYear,
        ),
        order: orderNumber(errorList),
      };
    }

    if (dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
      const formattedDate = `${coverEndDateYear}-${coverEndDateMonth}-${coverEndDateDay}`;
      const nowDate = moment().format('YYYY-MM-DD');

      if (moment(formattedDate).isBefore(nowDate)) {
        errorList.coverEndDate = {
          text: 'Cover End Date must be today or in the future',
          order: orderNumber(errorList),
        };
      }
    } else if (!dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
      errorList.coverEndDate = {
        text: dateValidationText(
          'Cover End Date',
          coverEndDateDay,
          coverEndDateMonth,
          coverEndDateYear,
        ),
        order: orderNumber(errorList),
      };
    }
    const hasValidRequestedCoverStartDate = dateHasAllValues(
      requestedCoverStartDateDay,
      requestedCoverStartDateMonth,
      requestedCoverStartDateYear,
    ) && !errorList.requestedCoverStartDate;

    const hasValidCoverEndDate = dateHasAllValues(
      coverEndDateDay,
      coverEndDateMonth,
      coverEndDateYear,
    ) && !errorList.requestedCoverStartDate;

    const hasValidCoverStartAndEndDates = (hasValidRequestedCoverStartDate && hasValidCoverEndDate);

    if (hasValidCoverStartAndEndDates) {
      const requestedCoverStartDate = `${requestedCoverStartDateYear}-${requestedCoverStartDateMonth}-${requestedCoverStartDateDay}`;
      const coverEndDate = `${coverEndDateYear}-${coverEndDateMonth}-${coverEndDateDay}`;

      if (moment(coverEndDate).isBefore(requestedCoverStartDate)) {
        errorList.coverEndDate = {
          text: 'Cover End Date cannot be before Requested Cover Start Date',
          order: orderNumber(errorList),
        };
      }
    }

    if (!uniqueIdentificationNumber) {
      errorList.uniqueIdentificationNumber = {
        order: orderNumber(errorList),
        text: 'Enter the Bond\'s unique identification number',
      };
    }
  }

  /* ************************************
  // financial details
  ***************************************
  */

  if (!hasValue(bondValue)) {
    errorList.bondValue = {
      order: orderNumber(errorList),
      text: 'Enter the Bond value',
    };
  }

  if (!hasValue(transactionCurrencySameAsSupplyContractCurrency)) {
    errorList.transactionCurrencySameAsSupplyContractCurrency = {
      order: orderNumber(errorList),
      text: 'Select if the currency for this Transaction is the same as your Supply Contract currency',
    };
  }

  if (transactionCurrencySameAsSupplyContractCurrency === 'false') {
    if (!hasValue(currency)) {
      errorList.currency = {
        order: orderNumber(errorList),
        text: 'Enter the Currency',
      };
    }

    if (!conversionRateIsValid(conversionRate)) {
      errorList.conversionRate = {
        text: conversionRateValidationText(
          conversionRate,
          'Conversion rate to the Supply Contract currency',
        ),
        order: orderNumber(errorList),
      };
    }

    if (dateHasAllValues(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear)) {
      const formattedDate = `${conversionRateDateYear}-${conversionRateDateMonth}-${conversionRateDateDay}`;
      const nowDate = moment().format('YYYY-MM-DD');

      if (moment(formattedDate).isAfter(nowDate)) {
        errorList.conversionRateDate = {
          text: 'Conversion rate date must be today or in the past',
          order: orderNumber(errorList),
        };
      }
    } else if (!dateHasAllValues(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear)) {
      errorList.conversionRateDate = {
        text: dateValidationText(
          'Conversion rate date',
          conversionRateDateDay,
          conversionRateDateMonth,
          conversionRateDateYear,
        ),
        order: orderNumber(errorList),
      };
    }
  }

  if (!riskMarginFeeIsValid(riskMarginFee)) {
    errorList.riskMarginFee = {
      text: riskMarginFeeValidationText(
        riskMarginFee,
        'Risk Margin Fee %',
      ),
      order: orderNumber(errorList),
    };
  }

  if (!coveredPercentageIsValid(coveredPercentage)) {
    errorList.coveredPercentage = {
      text: coveredPercentageValidationText(
        coveredPercentage,
        'Covered Percentage',
      ),
      order: orderNumber(errorList),
    };
  }

  if (hasValue(minimumRiskMarginFee) && !minimumRiskMarginFeeIsValid(minimumRiskMarginFee)) {
    errorList.minimumRiskMarginFee = {
      text: minimumRiskMarginFeeValidationText(
        minimumRiskMarginFee,
        'Minimum risk margin fee',
      ),
      order: orderNumber(errorList),
    };
  }

  /* ************************************
  // fee details
  ***************************************
  */
  if (!hasValue(feeType)) {
    errorList.feeType = {
      order: orderNumber(errorList),
      text: 'Enter the Fee type',
    };
  }

  if (feeType === 'In advance' || feeType === 'In arrear') {
    if (!hasValue(feeFrequency)) {
      errorList.feeFrequency = {
        order: orderNumber(errorList),
        text: 'Enter the Fee frequency',
      };
    }
  }

  if (!hasValue(dayCountBasis)) {
    errorList.dayCountBasis = {
      order: orderNumber(errorList),
      text: 'Enter the Day count basis',
    };
  }

  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return {
      count: totalErrors,
      conditionalErrorList,
    };
  }

  return {
    count: totalErrors,
    errorList,
    conditionalErrorList,
  };
};
