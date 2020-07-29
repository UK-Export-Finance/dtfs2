const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasAllValues,
  dateValidationText,
} = require('./date');

module.exports = (submittedValues, errorList, dealSubmissionDate, issuedDate) => {
  const newErrorList = errorList;

  if (moment(issuedDate).isBefore(dealSubmissionDate)) {
    const formattedDealSubmissionDate = moment(dealSubmissionDate).format('Do MMMM YYYY');
    newErrorList.issuedDate = {
      text: `Issued Date must be after ${formattedDealSubmissionDate}`,
      order: orderNumber(newErrorList),
    };  
  }

  return newErrorList;
};
