const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasAllValues,
  dateValidationText,
} = require('./date');
const { formattedTimestamp } = require('../../facility-dates/timestamp');
const isReadyForValidation = require('../helpers/isReadyForValidation.helper');
const coverDatesValidation = require('../helpers/coverDatesValidation.helpers');

module.exports = (submittedValues, deal, errorList) => {
  const newErrorList = errorList;
  const {
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
    requestedCoverStartDate,
  } = submittedValues;

  if (isReadyForValidation(deal, submittedValues)) {
    const {
      coverDayValidation,
      coverMonthValidation,
      coverYearValidation
    } = coverDatesValidation(coverEndDateDay, coverEndDateMonth, coverEndDateYear);

    if (dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
      const formattedDate = `${coverEndDateYear}-${coverEndDateMonth}-${coverEndDateDay}`;
      const nowDate = moment().format('YYYY-MM-DD');
      if ((moment(formattedDate, true).isBefore(nowDate))) {
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
        // converts from UTC
        const coverStartDate = formattedTimestamp(requestedCoverStartDate);
        // formats to the same format as formatted date for checking
        const requestedCoverStartDateFormatted = moment(coverStartDate).format('YYYY-MM-DD');
        if (moment(formattedDate).isSame(requestedCoverStartDateFormatted)) {
          newErrorList.coverEndDate = {
            text: 'Cover End Date must be after the Requested Cover Start Date',
            order: orderNumber(newErrorList),
          };
        }
      } else if (moment(formattedDate).isSame(nowDate)) {
        newErrorList.coverEndDate = {
          text: 'Cover End Date must be after the Requested Cover Start Date',
          order: orderNumber(newErrorList),
        };
      }
    } else if (!dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
      newErrorList.coverEndDate = {
        text: dateValidationText(
          'Cover End Date',
          coverEndDateDay,
          coverEndDateMonth,
          coverEndDateYear,
        ),
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
