const { isBefore, add, isAfter, startOfDay } = require('date-fns');
const { hasValue } = require('../../../../utils/string');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const { dateValidationText } = require('../../fields/date');
const coverDatesValidation = require('../../helpers/coverDatesValidation.helpers');
const { getStartOfDateFromEpochMillisecondString, getLongFormattedDate } = require('../../../helpers/date');

module.exports = (submittedValues, deal, errorList) => {
  const newErrorList = errorList;

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = submittedValues;

  const requestedCoverStartDate = getStartOfDateFromEpochMillisecondString(submittedValues.requestedCoverStartDate);

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

    if (submittedValues.requestedCoverStartDate) {
      if (isBefore(requestedCoverStartDate, startOfToday)) {
        newErrorList.requestedCoverStartDate = {
          text: 'Requested Cover Start Date must be on the application submission date or in the future',
          order: orderNumber(newErrorList),
        };
      } else if (!canEnterDateGreaterThan3Months) {
        const MAX_MONTHS_FROM_NOW = 3;

        const dateIsBeforeNow = isBefore(requestedCoverStartDate, startOfToday);
        const maxDate = add(startOfToday, { months: MAX_MONTHS_FROM_NOW });
        const dateIsAfterMaximum = isAfter(requestedCoverStartDate, maxDate);

        if (dateIsBeforeNow || dateIsAfterMaximum) {
          newErrorList.requestedCoverStartDate = {
            text: `Requested Cover Start Date must be between ${getLongFormattedDate(startOfToday)} and ${getLongFormattedDate(maxDate)}`,
            order: orderNumber(newErrorList),
          };
        }
      }
    }

    const requestedCoverStartDateHasSomeValues =
      hasValue(requestedCoverStartDateDay) || hasValue(requestedCoverStartDateMonth) || hasValue(requestedCoverStartDateYear);

    if (!submittedValues.requestedCoverStartDate && requestedCoverStartDateHasSomeValues) {
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
