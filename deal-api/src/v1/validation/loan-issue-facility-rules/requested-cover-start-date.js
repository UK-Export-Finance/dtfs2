const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasAllValues,
  dateHasSomeValues,
  dateValidationText,
} = require('../fields/date');

// TODO update to handle timestamp validation like in other requested-cover-start date rule.
module.exports = (submittedValues, errorList, dealSubmissionDate, requestedCoverStartDateTimestamp) => {
  const newErrorList = errorList;

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = submittedValues;

  // if (dateHasAllValues(requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear)) {
  if (requestedCoverStartDateTimestamp) {
    const formattedDealSubmissionDate = moment(dealSubmissionDate).format('Do MMMM YYYY');

    if (moment(requestedCoverStartDateTimestamp).isBefore(dealSubmissionDate)) {
      newErrorList.requestedCoverStartDate = {
        text: `Requested Cover Start Date must be after ${formattedDealSubmissionDate}`,
        order: orderNumber(newErrorList),
      };
    }

    const dealSubmissionDatePlus3Months = moment(dealSubmissionDate).add(3, 'month');

    if (moment(requestedCoverStartDateTimestamp).isAfter(dealSubmissionDatePlus3Months)) {
      newErrorList.requestedCoverStartDate = {
        text: `Requested Cover Start Date must be between ${formattedDealSubmissionDate} and ${moment(dealSubmissionDatePlus3Months).format('Do MMMM YYYY')}`,
        order: orderNumber(newErrorList),
      };
    }
  } else if (dateHasSomeValues(
    requestedCoverStartDateDay,
    requestedCoverStartDateMonth,
    requestedCoverStartDateYear,
  )) {
    newErrorList.requestedCoverStartDate = {
      text: dateValidationText(
        'Requested Cover Start Date',
        requestedCoverStartDateDay,
        requestedCoverStartDateMonth,
        requestedCoverStartDateYear,
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
