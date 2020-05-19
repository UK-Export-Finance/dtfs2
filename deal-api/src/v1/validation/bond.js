const moment = require('moment');
const { orderNumber } = require('../../utils/error-list-order-number');
const { hasValue } = require('../../utils/string');
const {
  dateHasAllValues,
  dateHasSomeValues,
  dateValidationText,
  addDaysToDate,
  now,
  dateIsInTimeframe,
} = require('./date-field');

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
          text: 'X Field is required',
        },
        requiredFieldWhenThisValueIsSet: {
          text: 'Y Field is required',
        },
      },
      possibleFieldValue: {
        requiredFieldWhenThisValueIsSet: {
          text: 'Field is required',
        }
      },
    },
  }
  */

  const conditionalErrorList = {
    bondStage: {
      Unissued: {
        ukefGuaranteeInMonths: {
          text: 'Length of time that the UKEF\'s guarantee will be in place for is required',
        },
      },
      Issued: {
        coverEndDate: {
          text: 'Cover End Date is required',
        },
        uniqueIdentificationNumber: {
          text: 'Bond\'s unique identification number is required',
        },
      },
    },
    transactionCurrencySameAsSupplyContractCurrency: {
      false: {
        currency: {
          text: 'Currency is required',
        },
        conversionRate: {
          text: 'Conversion rate to the Supply Contract currency is required',
        },
        conversionRateDate: {
          text: 'Conversion rate date is required',
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
      text: 'Bond type is required',
    };
  }

  if (!hasValue(bondStage)) {
    errorList.bondStage = {
      order: orderNumber(errorList),
      text: 'Bond stage is required',
    };
  }

  if (bondStage === 'Unissued') {
    if (!hasValue(ukefGuaranteeInMonths)) {
      errorList.ukefGuaranteeInMonths = {
        order: orderNumber(errorList),
        text: 'Length of time that the UKEF\'s guarantee will be in place for is required',
      };
    }
  }

  if (bondStage === 'Issued') {
    if (dateHasAllValues(requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear)) {
      const MAX_DAYS_FROM_NOW = 93;
      const nowDate = now();

      if (!dateIsInTimeframe(
        requestedCoverStartDateDay,
        requestedCoverStartDateMonth,
        requestedCoverStartDateYear,
        nowDate,
        addDaysToDate(nowDate, MAX_DAYS_FROM_NOW),
      )) {
        errorList.requestedCoverStartDate = {
          text: `(temp message): Requested Cover Start Date must be within ${MAX_DAYS_FROM_NOW} day timeframe`,
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

    if (!dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
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
        text: 'Bond\'s unique identification number is required',
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
      text: 'Bond value is required',
    };
  }

  if (!hasValue(transactionCurrencySameAsSupplyContractCurrency)) {
    errorList.transactionCurrencySameAsSupplyContractCurrency = {
      order: orderNumber(errorList),
      text: 'Is the currency for this Transaction the same as your Supply Contract currency? is required',
    };
  }

  if (transactionCurrencySameAsSupplyContractCurrency === 'false') {
    if (!hasValue(currency)) {
      errorList.currency = {
        order: orderNumber(errorList),
        text: 'Currency is required',
      };
    }

    if (!hasValue(conversionRate)) {
      errorList.conversionRate = {
        order: orderNumber(errorList),
        text: 'Conversion rate is required',
      };
    }

    if (!dateHasAllValues(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear)) {
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

  if (!hasValue(riskMarginFee)) {
    errorList.riskMarginFee = {
      order: orderNumber(errorList),
      text: 'Risk Margin Fee % is required',
    };
  }

  if (!hasValue(coveredPercentage)) {
    errorList.coveredPercentage = {
      order: orderNumber(errorList),
      text: 'Covered Percentage is required',
    };
  }

  /* ************************************
  // fee details
  ***************************************
  */
  if (!hasValue(feeType)) {
    errorList.feeType = {
      order: orderNumber(errorList),
      text: 'Fee type is required',
    };
  }

  if (feeType === 'In advance' || feeType === 'In arrear') {
    if (!hasValue(feeFrequency)) {
      errorList.feeFrequency = {
        order: orderNumber(errorList),
        text: 'Fee frequency is required',
      };
    }
  }

  if (!hasValue(dayCountBasis)) {
    errorList.dayCountBasis = {
      order: orderNumber(errorList),
      text: 'Day count basis is required',
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
