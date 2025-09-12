const { isBefore, isSameDay } = require('date-fns');
const { orderNumber } = require('../../../utils/error-list-order-number');
const isReadyForValidation = require('../helpers/isReadyForValidation.helper');
const { getStartOfDateFromEpochMillisecondString, getStartOfDateFromDayMonthYearStrings } = require('../../helpers/date');
const { dateHasAllValues } = require('./date');

module.exports = (submittedValues, deal, errorList) => {
  const newErrorList = errorList;

  const { 'coverEndDate-day': coverEndDateDay, 'coverEndDate-month': coverEndDateMonth, 'coverEndDate-year': coverEndDateYear } = submittedValues;
  const requestedCoverStartDate = getStartOfDateFromEpochMillisecondString(submittedValues.requestedCoverStartDate);

  if (isReadyForValidation(deal, submittedValues)) {
    const hasValidRequestedCoverStartDate = submittedValues.requestedCoverStartDate && !newErrorList.requestedCoverStartDate;

    const hasValidCoverEndDate = dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear) && !newErrorList.coverEndDate;

    if (hasValidRequestedCoverStartDate && hasValidCoverEndDate) {
      const coverEndDate = getStartOfDateFromDayMonthYearStrings(coverEndDateDay, coverEndDateMonth, coverEndDateYear);

      if (isBefore(coverEndDate, requestedCoverStartDate)) {
        newErrorList.coverEndDate = {
          text: 'Cover End Date cannot be before Requested Cover Start Date',
          order: orderNumber(newErrorList),
        };
      }

      if (isSameDay(coverEndDate, requestedCoverStartDate)) {
        newErrorList.coverEndDate = {
          text: 'Cover End Date must be after the Requested Cover Start Date',
          order: orderNumber(newErrorList),
        };
      }
    }
  }

  return newErrorList;
};
