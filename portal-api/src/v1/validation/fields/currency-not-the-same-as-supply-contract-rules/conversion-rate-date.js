const moment = require('moment');
const {
  dateHasAllValues,
  dateValidationText,
} = require('../date');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const coverDatesValidation = require('../../helpers/coverDatesValidation.helpers');

module.exports = (facility, errorList, deal) => {
  const newErrorList = { ...errorList };
  const {
    'conversionRateDate-day': conversionRateDateDay,
    'conversionRateDate-month': conversionRateDateMonth,
    'conversionRateDate-year': conversionRateDateYear,
    v1ExtraInfo
  } = facility;

  // only run this validation if first submission - submissionDate does not exist on first submission
  if (!deal?.details?.submissionDate) {
    const {
      coverDayValidation,
      coverMonthValidation,
      coverYearValidation
    } = coverDatesValidation(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear);

    if (dateHasAllValues(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear)) {
      const formattedDate = `${conversionRateDateYear}-${conversionRateDateMonth}-${conversionRateDateDay}`;
      const nowDate = moment().format('YYYY-MM-DD');

      if (moment(formattedDate, true).isAfter(nowDate) && !v1ExtraInfo) {
        newErrorList.conversionRateDate = {
          text: 'Conversion rate date must be today or in the past',
          order: orderNumber(newErrorList),
        };
      }

      const MAX_DAYS_FROM_NOW = moment(nowDate).subtract(29, 'day');

      if (moment(formattedDate, true).isBefore(MAX_DAYS_FROM_NOW) && !v1ExtraInfo) {
        newErrorList.conversionRateDate = {
          text: `Conversion rate date must be between ${moment(MAX_DAYS_FROM_NOW).format('Do MMMM YYYY')} and ${moment(nowDate).format('Do MMMM YYYY')}`,
          order: orderNumber(newErrorList),
        };
      }
    } else if (!dateHasAllValues(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear)) {
      newErrorList.conversionRateDate = {
        text: dateValidationText(
          'Conversion rate date',
          conversionRateDateDay,
          conversionRateDateMonth,
          conversionRateDateYear,
        ),
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
