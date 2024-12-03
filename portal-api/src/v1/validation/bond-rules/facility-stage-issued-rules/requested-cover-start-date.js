const { startOfDay, isBefore, addMonths, isValid } = require('date-fns');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const { dateValidationText, dateHasSomeValues } = require('../../fields/date');
const coverDatesValidation = require('../../helpers/coverDatesValidation.helpers');
const { getStartOfDateFromEpochMillisecondString, getLongFormattedDate } = require('../../../helpers/date');

module.exports = (submittedValues, deal, errorList) => {
  const newErrorList = errorList;

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = submittedValues;

  const requestedCoverStartDate = getStartOfDateFromEpochMillisecondString(String(submittedValues.requestedCoverStartDate));

  // EC 15 is: 'Cover Start Date is no more than three months from the date of submission'
  const eligibilityCriteria15 = deal.eligibility.criteria.find((c) => c.id === 15);
  const canEnterDateGreaterThan3Months = eligibilityCriteria15 && eligibilityCriteria15.answer === false;

  const dealHasBeenSubmitted = deal.details.submissionDate;

  const startOfToday = startOfDay(new Date());

  if (!dealHasBeenSubmitted) {
    const { coverDayValidation, coverMonthValidation, coverYearValidation } = coverDatesValidation(
      requestedCoverStartDateDay,
      requestedCoverStartDateMonth,
      requestedCoverStartDateYear,
    );

    if (isValid(requestedCoverStartDate)) {
      if (isBefore(requestedCoverStartDate, startOfToday)) {
        newErrorList.requestedCoverStartDate = {
          text: 'Requested Cover Start Date must be on the application submission date or in the future',
          order: orderNumber(newErrorList),
        };
      } else if (!canEnterDateGreaterThan3Months) {
        const MAX_MONTHS_FROM_NOW = 3;
        const maximumDate = addMonths(startOfToday, MAX_MONTHS_FROM_NOW);

        const isWithinValidDateRange = !isBefore(requestedCoverStartDate, startOfToday) && isBefore(requestedCoverStartDate, maximumDate);

        if (!isWithinValidDateRange) {
          newErrorList.requestedCoverStartDate = {
            text: `Requested Cover Start Date must be between ${getLongFormattedDate(startOfToday)} and ${getLongFormattedDate(maximumDate)}`,
            order: orderNumber(newErrorList),
          };
        }
      }
    }

    if (!isValid(requestedCoverStartDate) && dateHasSomeValues(requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear)) {
      newErrorList.requestedCoverStartDate = {
        text: dateValidationText('Requested Cover Start Date', requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear),
        order: orderNumber(newErrorList),
      };
    }

    // coverDayValidation.error only exists if validation errors present
    if (coverDayValidation.error && requestedCoverStartDateDay) {
      newErrorList.requestedCoverStartDate = {
        text: 'The day for the requested Cover Start Date must include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }

    if (coverMonthValidation.error && requestedCoverStartDateMonth) {
      newErrorList.requestedCoverStartDate = {
        text: 'The month for the requested Cover Start Date must include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }
    if (coverYearValidation.error && requestedCoverStartDateYear) {
      newErrorList.requestedCoverStartDate = {
        text: 'The year for the requested Cover Start Date must include 4 numbers',
        order: orderNumber(newErrorList),
      };
    }
  }

  return newErrorList;
};
