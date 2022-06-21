const moment = require('moment');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const {
  dateHasSomeValues,
  dateValidationText,
} = require('../date');
const { formattedTimestamp } = require('../../../facility-dates/timestamp');
const CONSTANTS = require('../../../../constants');

module.exports = (
  submittedValues,
  errorList,
  deal,
) => {
  const newErrorList = errorList;

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = submittedValues;

  const { submissionType: dealSubmissionType } = deal;

  const {
    submissionDate: dealSubmissionDateTimestamp,
    manualInclusionApplicationSubmissionDate: manualInclusionApplicationSubmissionDateTimestamp,
    manualInclusionNoticeSubmissionDate: manualInclusionNoticeSubmissionDateTimestamp,
  } = deal.details;

  const dealSubmissionDate = formattedTimestamp(dealSubmissionDateTimestamp);
  const requestedCoverStartDate = formattedTimestamp(submittedValues.requestedCoverStartDate);
  const manualInclusionApplicationSubmissionDate = formattedTimestamp(manualInclusionApplicationSubmissionDateTimestamp);
  const manualInclusionNoticeSubmissionDate = formattedTimestamp(manualInclusionNoticeSubmissionDateTimestamp);

  // EC 15 is: 'Cover Start Date is no more than three months from the date of submission'
  const eligibilityCriteria15 = deal.eligibility.criteria.find((c) => c.id === 15);
  const canEnterDateGreaterThan3Months = eligibilityCriteria15 && eligibilityCriteria15.answer === false;

  if (requestedCoverStartDate) {
    const formattedDealSubmissionDate = moment(dealSubmissionDate).format('Do MMMM YYYY');
    const formattedManualInclusionNoticeSubmissionDate = moment(manualInclusionNoticeSubmissionDate).format('Do MMMM YYYY');
    const formattedManualInclusionApplicationSubmissionDate = moment(manualInclusionApplicationSubmissionDate).format('Do MMMM YYYY');

    const today = moment();
    const todayPlus3Months = moment(today).add(3, 'month');
    const todayPlus3MonthsFormatted = moment(todayPlus3Months).format('Do MMMM YYYY');

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
    } else if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
      if (moment(requestedCoverStartDate).isBefore(manualInclusionApplicationSubmissionDate)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be after ${formattedManualInclusionApplicationSubmissionDate}`,
          order: orderNumber(newErrorList),
        };
      }

      if (manualInclusionNoticeSubmissionDateTimestamp) {
        if (moment(requestedCoverStartDate).isBefore(manualInclusionNoticeSubmissionDate)) {
          newErrorList.requestedCoverStartDate = {
            text: `Requested Cover Start Date must be after ${formattedManualInclusionNoticeSubmissionDate}`,
            order: orderNumber(newErrorList),
          };
        }
      }

      if (!canEnterDateGreaterThan3Months && moment(requestedCoverStartDate).isBefore(manualInclusionApplicationSubmissionDate)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedManualInclusionApplicationSubmissionDate} and ${todayPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }

      if (!canEnterDateGreaterThan3Months && moment(requestedCoverStartDate).isAfter(todayPlus3Months)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedManualInclusionApplicationSubmissionDate} and ${todayPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
    } else if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      if (manualInclusionNoticeSubmissionDateTimestamp) {
        if (moment(requestedCoverStartDate).isBefore(manualInclusionNoticeSubmissionDate)) {
          newErrorList.requestedCoverStartDate = {
            text: `Requested Cover Start Date must be after ${formattedManualInclusionNoticeSubmissionDate}`,
            order: orderNumber(newErrorList),
          };
        }
      }

      if (!canEnterDateGreaterThan3Months && moment(requestedCoverStartDate).isAfter(todayPlus3Months)) {
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
