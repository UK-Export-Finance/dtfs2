const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const { formattedTimestamp } = require('../../facility-dates/timestamp');

const requestedCoverStartDateRule = (facility, errorList) => {
  const { requestedCoverStartDate } = facility;
  const newErrorList = errorList;

  const requestedCoverStartDateTimestamp = formattedTimestamp(facility.requestedCoverStartDate);

  if (requestedCoverStartDate) {
    const today = moment();
    const todayFormatted = moment(today).format('Do MMMM YYYY');

    if (moment(requestedCoverStartDateTimestamp).isBefore(today, 'day')) {
      newErrorList.requestedCoverStartDate = {
        text: 'Requested Cover Start Date must be today or in the future',
        order: orderNumber(newErrorList),
      };
    }
  }

  return newErrorList;
};
  
module.exports = (
  facility,
  deal,
) => {
  let errorList = {};

  errorList = requestedCoverStartDateRule(
    facility,
    errorList,
  );

  return errorList;
};
