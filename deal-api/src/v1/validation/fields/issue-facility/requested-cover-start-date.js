const moment = require('moment');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const {
  dateHasSomeValues,
  dateValidationText,
} = require('../date');
const { formattedTimestamp } = require('../../../facility-dates/timestamp');
const CONSTANTS = require('../../../../constants');
const { add } = require('cypress/types/lodash');

module.exports = (submittedValues, errorList, dealSubmissionType, dealSubmissionDateTimestamp) => {
  const newErrorList = errorList;

  const dealSubmissionDate = formattedTimestamp(dealSubmissionDateTimestamp);
  const requestedCoverStartDateTimestamp = formattedTimestamp(submittedValues.requestedCoverStartDate);
  const today = moment();

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = submittedValues;

  if (requestedCoverStartDateTimestamp) {
    const formattedDealSubmissionDate = moment(dealSubmissionDate).format('Do MMMM YYYY');
    // const dealSubmissionDatePlus3Months = moment(dealSubmissionDate).add(3, 'month');
    const todayPlus3Months = moment().add(3, 'month');

    if (moment(requestedCoverStartDateTimestamp).isBefore(today)) {
      newErrorList.requestedCoverStartDate = {
        text: 'Requested Cover Start Date must be after today',
        order: orderNumber(newErrorList),
      };
    }

    if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      if (moment(requestedCoverStartDateTimestamp).isBefore(dealSubmissionDate)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be after ${formattedDealSubmissionDate}`,
          order: orderNumber(newErrorList),
        };
      }
    } else if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
              || dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {

      if (moment(requestedCoverStartDateTimestamp).isAfter(todayPlus3Months)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedDealSubmissionDate} and ${moment(todayPlus3Months).format('Do MMMM YYYY')}`,
          order: orderNumber(newErrorList),
        };
      }
    }

    /*
    if (moment(requestedCoverStartDateTimestamp).isBefore(dealSubmissionDate)) {
      newErrorList.requestedCoverStartDate = {
        text: `Requested Cover Start Date must be after ${formattedDealSubmissionDate}`,
        order: orderNumber(newErrorList),
      };
    }

    if (moment(requestedCoverStartDateTimestamp).isBefore(today)) {
      newErrorList.requestedCoverStartDate = {
        text: 'Requested Cover Start Date must be after today',
        order: orderNumber(newErrorList),
      };
    }

    if (moment(requestedCoverStartDateTimestamp).isAfter(dealSubmissionDatePlus3Months)) {
      newErrorList.requestedCoverStartDate = {
        text: `Requested Cover Start Date must be between ${formattedDealSubmissionDate} and ${moment(dealSubmissionDatePlus3Months).format('Do MMMM YYYY')}`,
        order: orderNumber(newErrorList),
      };
    }
    */
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
