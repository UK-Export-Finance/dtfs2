const { sub, isAfter, startOfDay, isBefore } = require('date-fns');
const { CURRENCY } = require('@ukef/dtfs2-common');

const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');
const { getStartOfDateFromDayMonthYearStrings } = require('../../helpers/date');
const { dateHasAllValues, dateHasSomeValues } = require('../fields/date');

module.exports = (submissionDetails, errorList, deal) => {
  const newErrorList = { ...errorList };

  // only run this validation if first submission - submissionDate does not exist on first submission
  if (!deal?.details?.submissionDate) {
    // check to see if we're a non-GBP currency
    if (hasValue(submissionDetails.supplyContractCurrency) && submissionDetails.supplyContractCurrency.id !== CURRENCY.GBP) {
      const day = submissionDetails['supplyContractConversionDate-day'];
      const month = submissionDetails['supplyContractConversionDate-month'];
      const year = submissionDetails['supplyContractConversionDate-year'];

      // if we have all the values, check that the date..
      if (dateHasAllValues(day, month, year)) {
        const submisionDateStartOfDay = getStartOfDateFromDayMonthYearStrings(day, month, year);
        const startOfToday = startOfDay(new Date());
        const thirtyDaysAgoStartOfDay = sub(startOfToday, { days: 30 });

        // can't be in the future
        if (isAfter(submisionDateStartOfDay, startOfToday)) {
          newErrorList.supplyContractConversionDate = {
            order: orderNumber(newErrorList),
            text: 'Supply Contract conversion date cannot be in the future',
          };
        }

        // can't be more than 30 days old
        if (isBefore(submisionDateStartOfDay, thirtyDaysAgoStartOfDay)) {
          newErrorList.supplyContractConversionDate = {
            order: orderNumber(newErrorList),
            text: 'Supply Contract conversion date cannot be more than 30 days in the past',
          };
        }
      } else {
        // if we don't have all the values, raise an error against the date..
        newErrorList.supplyContractConversionDate = {
          order: orderNumber(newErrorList),
          text: 'Supply Contract conversion date is required for non-GBP currencies',
        };

        // if we have one or more fields, but not all the fields - flag the missing fields as required
        if (dateHasSomeValues(day, month, year)) {
          if (!hasValue(day)) {
            newErrorList['supplyContractConversionDate-day'] = {
              order: orderNumber(newErrorList),
              text: 'Supply Contract conversion date Day is required for non-GBP currencies',
            };
          }
          if (!hasValue(month)) {
            newErrorList['supplyContractConversionDate-month'] = {
              order: orderNumber(newErrorList),
              text: 'Supply Contract conversion date Month is required for non-GBP currencies',
            };
          }
          if (!hasValue(year)) {
            newErrorList['supplyContractConversionDate-year'] = {
              order: orderNumber(newErrorList),
              text: 'Supply Contract conversion date Year is required for non-GBP currencies',
            };
          }
        }
      }
    }
  }
  return newErrorList;
};
