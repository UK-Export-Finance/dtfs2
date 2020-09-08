const moment = require('moment');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const {
  dateHasSomeValues,
  dateValidationText,
} = require('../date');
const { formattedTimestamp } = require('../../../facility-dates/timestamp');
const CONSTANTS = require('../../../../constants');

module.exports = (submittedValues, errorList, dealSubmissionType, dealSubmissionDateTimestamp, manualInclusionNoticeSubmissionDateTimestamp) => {
  const newErrorList = errorList;

  const dealSubmissionDate = formattedTimestamp(dealSubmissionDateTimestamp);
  const requestedCoverStartDate = formattedTimestamp(submittedValues.requestedCoverStartDate);
  const manualInclusionNoticeSubmissionDate = formattedTimestamp(manualInclusionNoticeSubmissionDateTimestamp);
  const today = moment();

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = submittedValues;

  if (requestedCoverStartDate) {
    const formattedDealSubmissionDate = moment(dealSubmissionDate).format('Do MMMM YYYY');
    const formattedManualInclusionNoticeSubmissionDate = moment(manualInclusionNoticeSubmissionDate).format('Do MMMM YYYY');

    const today = moment();
    const todayFormatted = moment(today).format('Do MMMM YYYY');
  
    const todayPlus3Months = moment(today).add(3, 'month');
    const todayPlus3MonthsFormatted = moment(todayPlus3Months).format('Do MMMM YYYY')

    if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      if (moment(requestedCoverStartDate).isBefore(dealSubmissionDate)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be after ${formattedDealSubmissionDate}`,
          order: orderNumber(newErrorList),
        };
      }

      if (moment(requestedCoverStartDate).isAfter(todayPlus3Months)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedDealSubmissionDate} and ${todayPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
    } else if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
              || dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      if (moment(requestedCoverStartDate).isBefore(today)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be after ${todayFormatted}`,
          order: orderNumber(newErrorList),
        };
      }

      // TODO - is this valid for both MIA and MIN?
      if (manualInclusionNoticeSubmissionDateTimestamp) {
        if (moment(requestedCoverStartDate).isBefore(manualInclusionNoticeSubmissionDate)) {
          newErrorList.requestedCoverStartDate = {
            text: `Requested Cover Start Date must be after ${formattedManualInclusionNoticeSubmissionDate}`,
            order: orderNumber(newErrorList),
          };
        }
      }

      if (moment(requestedCoverStartDate).isAfter(todayPlus3Months)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedManualInclusionNoticeSubmissionDate} and ${todayPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
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
