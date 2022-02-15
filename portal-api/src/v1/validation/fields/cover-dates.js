const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasAllValues,
} = require('./date');
const { formattedTimestamp } = require('../../facility-dates/timestamp');

module.exports = (submittedValues, errorList) => {
  const newErrorList = errorList;

  const requestedCoverStartDateTimestamp = formattedTimestamp(submittedValues.requestedCoverStartDate);

  const {
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
  } = submittedValues;

  const hasValidRequestedCoverStartDate = (requestedCoverStartDateTimestamp && !newErrorList.requestedCoverStartDate);

  const hasValidCoverEndDate = dateHasAllValues(
    coverEndDateDay,
    coverEndDateMonth,
    coverEndDateYear,
  ) && !newErrorList.coverEndDate;

  const hasValidCoverStartAndEndDates = (hasValidRequestedCoverStartDate && hasValidCoverEndDate);

  if (hasValidCoverStartAndEndDates) {
    const requestedCoverStartDateDay = moment(requestedCoverStartDateTimestamp).format('DD');
    const requestedCoverStartDateMonth = moment(requestedCoverStartDateTimestamp).format('MM');
    const requestedCoverStartDateYear = moment(requestedCoverStartDateTimestamp).format('YYYY');

    const requestedCoverStartDate = `${requestedCoverStartDateYear}-${requestedCoverStartDateMonth}-${requestedCoverStartDateDay}`;
    const coverEndDate = `${coverEndDateYear}-${coverEndDateMonth}-${coverEndDateDay}`;

    if (moment(coverEndDate).isBefore(requestedCoverStartDate)) {
      newErrorList.coverEndDate = {
        text: 'Cover End Date cannot be before Requested Cover Start Date',
        order: orderNumber(newErrorList),
      };
    }

    if (moment(coverEndDate).isSame(requestedCoverStartDate)) {
      newErrorList.coverEndDate = {
        text: 'Cover End Date must be after the Requested Cover Start Date',
        order: orderNumber(newErrorList),
      };
    }
  }

  return newErrorList;
};
