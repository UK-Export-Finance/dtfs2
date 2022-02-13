const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number.util');
const {
  dateHasAllValues,
  dateValidationText,
} = require('./date');
const { formattedTimestamp } = require('../../facility-dates/timestamp');

module.exports = (facility, errorList, deal) => {
  const newErrorList = errorList;

  const {
    'issuedDate-day': issuedDateDay,
    'issuedDate-month': issuedDateMonth,
    'issuedDate-year': issuedDateYear,
  } = facility;

  const {
    submissionDate: dealSubmissionDateTimestamp,
  } = deal.details;

  const dealSubmissionDate = formattedTimestamp(dealSubmissionDateTimestamp);
  const issuedDate = formattedTimestamp(facility.issuedDate);
  const today = moment();

  if (dateHasAllValues(issuedDateDay, issuedDateMonth, issuedDateYear)) {
    if (!moment(issuedDate).isSameOrAfter(dealSubmissionDate, 'day')) {
      const formattedDealSubmissionDate = moment(dealSubmissionDate).format('Do MMMM YYYY');

      newErrorList.issuedDate = {
        text: `Issued Date must be on or after ${formattedDealSubmissionDate}`,
        order: orderNumber(newErrorList),
      };
    }

    if (moment(issuedDate).isAfter(today, 'day')) {
      newErrorList.issuedDate = {
        text: 'Issued Date must be today or in the past',
        order: orderNumber(newErrorList),
      };
    }
  } else if (!facility.issuedDate && !dateHasAllValues(issuedDateDay, issuedDateMonth, issuedDateYear)) {
    newErrorList.issuedDate = {
      text: dateValidationText(
        'Issued Date',
        issuedDateDay,
        issuedDateMonth,
        issuedDateYear,
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
