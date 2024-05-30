const { isAfter, sub, isBefore, startOfDay } = require('date-fns');
const { dateValidationText, dateHasAllValues } = require('../date');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const coverDatesValidation = require('../../helpers/coverDatesValidation.helpers');
const { getStartOfDateFromDayMonthYearStrings, getLongFormattedDate } = require('../../../helpers/date');

module.exports = (facility, errorList, deal) => {
  const newErrorList = { ...errorList };
  const {
    'conversionRateDate-day': conversionRateDateDay,
    'conversionRateDate-month': conversionRateDateMonth,
    'conversionRateDate-year': conversionRateDateYear,
    v1ExtraInfo,
  } = facility;

  // only run this validation if first submission - submissionDate does not exist on first submission
  if (!deal?.details?.submissionDate) {
    const { coverDayValidation, coverMonthValidation, coverYearValidation } = coverDatesValidation(
      conversionRateDateDay,
      conversionRateDateMonth,
      conversionRateDateYear,
    );

    if (dateHasAllValues(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear)) {
      const conversionRateDateStartOfDay = getStartOfDateFromDayMonthYearStrings(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear);
      const startOfToday = startOfDay(new Date());

      if (isAfter(conversionRateDateStartOfDay, startOfToday) && !v1ExtraInfo) {
        newErrorList.conversionRateDate = {
          text: 'Conversion rate date must be today or in the past',
          order: orderNumber(newErrorList),
        };
      }

      const MAX_DAYS_FROM_NOW = 29;
      const earliestAllowedDate = sub(startOfToday, { days: MAX_DAYS_FROM_NOW });

      if (isBefore(conversionRateDateStartOfDay, earliestAllowedDate) && !v1ExtraInfo) {
        newErrorList.conversionRateDate = {
          text: `Conversion rate date must be between ${getLongFormattedDate(earliestAllowedDate)} and ${getLongFormattedDate(startOfToday)}`,
          order: orderNumber(newErrorList),
        };
      }
    } else {
      newErrorList.conversionRateDate = {
        text: dateValidationText('Conversion rate date', conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear),
        order: orderNumber(newErrorList),
      };
    }

    if (coverDayValidation.error && conversionRateDateDay) {
      // error object does not exist if no errors in validation
      newErrorList.conversionRateDate = {
        text: 'The day for the conversion rate must include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }

    if (coverMonthValidation.error && conversionRateDateMonth) {
      // error object does not exist if no errors in validation
      newErrorList.conversionRateDate = {
        text: 'The month for the conversion rate must include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }
    if (coverYearValidation.error && conversionRateDateYear) {
      // error object does not exist if no errors in validation
      newErrorList.conversionRateDate = {
        text: 'The year for the conversion rate must include 4 numbers',
        order: orderNumber(newErrorList),
      };
    }
  }

  return newErrorList;
};
