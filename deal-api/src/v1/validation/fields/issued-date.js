const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasAllValues,
  dateValidationText,
} = require('./date');
const { formattedTimestamp } = require('../../facility-dates/timestamp');

module.exports = (submittedValues, errorList, dealSubmissionDateTimestamp) => {
  const newErrorList = errorList;

  const dealSubmissionDate = formattedTimestamp(dealSubmissionDateTimestamp);
  const issuedDate = formattedTimestamp(submittedValues.issuedDate);

  const {
    'issuedDate-day': issuedDateDay,
    'issuedDate-month': issuedDateMonth,
    'issuedDate-year': issuedDateYear,
  } = submittedValues;

  if (dateHasAllValues(issuedDateDay, issuedDateMonth, issuedDateYear)) {
    if (!moment(issuedDate).isSameOrAfter(dealSubmissionDate, 'day')) {
      const formattedDealSubmissionDate = moment(dealSubmissionDate).format('Do MMMM YYYY');

      newErrorList.issuedDate = {
        text: `Issued Date must be on or after ${formattedDealSubmissionDate}`,
        order: orderNumber(newErrorList),
      };
    }
  } else if (!dateHasAllValues(issuedDateDay, issuedDateMonth, issuedDateYear)) {
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
