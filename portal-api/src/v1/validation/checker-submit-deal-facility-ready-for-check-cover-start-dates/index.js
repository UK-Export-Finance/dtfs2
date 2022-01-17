const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const { formattedTimestamp } = require('../../facility-dates/timestamp');
const CONSTANTS = require('../../../constants');

const facilityReadyForCheckRequestedCoverStartDateRule = (facility, errorList) => {
  const {
    requestedCoverStartDate,
    status,
  } = facility;
  const newErrorList = errorList;

  if (requestedCoverStartDate) {
    if (status === CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL) {
      const requestedCoverStartDateTimestamp = formattedTimestamp(facility.requestedCoverStartDate);
      const today = moment();

      if (moment(requestedCoverStartDateTimestamp).isBefore(today, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: 'Requested Cover Start Date must be today or in the future',
          order: orderNumber(newErrorList),
        };
      }
    }
  }

  return newErrorList;
};

module.exports = (
  facility,
) => {
  let errorList = {};

  errorList = facilityReadyForCheckRequestedCoverStartDateRule(
    facility,
    errorList,
  );

  return errorList;
};
