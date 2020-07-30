const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasSomeValues,
  dateValidationText,
} = require('../fields/date');
const { formattedTimestamp } = require('../../section-dates/requested-cover-start-date');

// TODO update to handle timestamp validation like in other requested-cover-start date rule.
module.exports = (submittedValues, errorList, dealSubmissionDateTimestamp) => {
  const newErrorList = errorList;

  const dealSubmissionDate = formattedTimestamp(dealSubmissionDateTimestamp);
  const requestedCoverStartDateTimestamp = formattedTimestamp(submittedValues.requestedCoverStartDate);

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = submittedValues;

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
