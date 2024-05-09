const { isBefore, startOfDay, isSameDay } = require('date-fns');
const { orderNumber } = require('../../../utils/error-list-order-number');
const { dateValidationText, dateHasAllValues } = require('./date');
const isReadyForValidation = require('../helpers/isReadyForValidation.helper');
const coverDatesValidation = require('../helpers/coverDatesValidation.helpers');
const { getStartOfDateFromEpochMillisecondString, getStartOfDateFromDayMonthYearStrings } = require('../../helpers/date');

module.exports = (submittedValues, deal, errorList) => {
  const newErrorList = errorList;
  const {
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
    requestedCoverStartDate,
  } = submittedValues;

  if (isReadyForValidation(deal, submittedValues)) {
    const { coverDayValidation, coverMonthValidation, coverYearValidation } = coverDatesValidation(coverEndDateDay, coverEndDateMonth, coverEndDateYear);

    if (dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
      const coverEndDate = getStartOfDateFromDayMonthYearStrings(coverEndDateDay, coverEndDateMonth, coverEndDateYear);
      const startOfToday = startOfDay(new Date());
      if (isBefore(coverEndDate, startOfToday)) {
        newErrorList.coverEndDate = {
          text: 'Cover End Date must be today or in the future',
          order: orderNumber(newErrorList),
        };
      }

      /**
       * validation if requested cover start date
       * checks if set, then the cover end date is not the same
       * if null, means that cover starts on submission so checks if the same as now
       * throws error if dates are the same
       */
      if (requestedCoverStartDate) {
        const coverStartDate = getStartOfDateFromEpochMillisecondString(requestedCoverStartDate);

        if (isSameDay(coverEndDate, coverStartDate)) {
          newErrorList.coverEndDate = {
            text: 'Cover End Date must be after the Requested Cover Start Date',
            order: orderNumber(newErrorList),
          };
        }
      } else if (isSameDay(coverEndDate, startOfToday)) {
        newErrorList.coverEndDate = {
          text: 'Cover End Date must be after the Requested Cover Start Date',
          order: orderNumber(newErrorList),
        };
      }
    } else {
      newErrorList.coverEndDate = {
        text: dateValidationText('Cover End Date', coverEndDateDay, coverEndDateMonth, coverEndDateYear),
        order: orderNumber(newErrorList),
      };
    }

    // check if cover start day only has 2 numbers
    if (coverDayValidation.error && coverEndDateDay) {
      newErrorList.coverEndDate = {
        text: 'The day for the cover end date must only include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }

    // check if cover end month only has 2 numbers
    if (coverMonthValidation.error && coverEndDateMonth) {
      newErrorList.coverEndDate = {
        text: 'The month for the cover end date must only include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }

    // error object does not exist if no errors in validation
    if (coverYearValidation.error && coverEndDateYear) {
      newErrorList.coverEndDate = {
        text: 'The year for the Cover End Date must include 4 numbers',
        order: orderNumber(newErrorList),
      };
    }
  }

  return newErrorList;
};
