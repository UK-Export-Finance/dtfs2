const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasAllValues,
} = require('./date');

module.exports = (loan, errorList) => {
  const newErrorList = errorList;

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
  } = loan;

  const hasValidRequestedCoverStartDate = dateHasAllValues(
    requestedCoverStartDateDay,
    requestedCoverStartDateMonth,
    requestedCoverStartDateYear,
  ) && !newErrorList.requestedCoverStartDate;

  const hasValidCoverEndDate = dateHasAllValues(
    coverEndDateDay,
    coverEndDateMonth,
    coverEndDateYear,
  ) && !newErrorList.requestedCoverStartDate;

  const hasValidCoverStartAndEndDates = (hasValidRequestedCoverStartDate && hasValidCoverEndDate);

  if (hasValidCoverStartAndEndDates) {
    const requestedCoverStartDate = `${requestedCoverStartDateYear}-${requestedCoverStartDateMonth}-${requestedCoverStartDateDay}`;
    const coverEndDate = `${coverEndDateYear}-${coverEndDateMonth}-${coverEndDateDay}`;

    if (moment(coverEndDate).isBefore(requestedCoverStartDate)) {
      newErrorList.coverEndDate = {
        text: 'Cover End Date cannot be before Requested Cover Start Date',
        order: orderNumber(newErrorList),
      };
    }
  }

  return newErrorList;
};
