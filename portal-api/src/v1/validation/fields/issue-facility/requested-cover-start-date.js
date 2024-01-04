const moment = require('moment');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const { dateHasSomeValues, dateValidationText } = require('../date');
const { formattedTimestamp } = require('../../../facility-dates/timestamp');
const CONSTANTS = require('../../../../constants');
const coverDatesValidation = require('../../helpers/coverDatesValidation.helpers');

module.exports = (submittedValues, errorList, deal) => {
  const newErrorList = errorList;

  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
    specialIssuePermission,
  } = submittedValues;

  const { submissionType: dealSubmissionType } = deal;

  const { submissionDate: dealSubmissionDateTimestamp, manualInclusionNoticeSubmissionDate: manualInclusionNoticeSubmissionDateTimestamp } = deal.details;

  const dealSubmissionDate = formattedTimestamp(dealSubmissionDateTimestamp);
  const requestedCoverStartDate = formattedTimestamp(submittedValues.requestedCoverStartDate);
  const manualInclusionNoticeSubmissionDate = formattedTimestamp(manualInclusionNoticeSubmissionDateTimestamp);
  // EC 15 is: 'Cover Start Date is no more than three months from the date of submission'
  const eligibilityCriteria15 = deal.eligibility.criteria.find((c) => c.id === 15);
  const canEnterDateGreaterThan3Months = eligibilityCriteria15 && eligibilityCriteria15.answer === false;

  const formattedDealSubmissionDate = moment(dealSubmissionDate).format('Do MMMM YYYY');
  const formattedManualInclusionNoticeSubmissionDate = moment(manualInclusionNoticeSubmissionDate).format('Do MMMM YYYY');

  const today = moment();
  const formattedToday = moment(today).format('Do MMMM YYYY');
  const todayPlus3Months = moment(today).add(3, 'month');
  const todayPlus3MonthsFormatted = moment(todayPlus3Months).format('Do MMMM YYYY');

  const dealSubmissionPlus3Months = moment(dealSubmissionDate).add(3, 'month');
  const dealSubmissionPlus3MonthsFormatted = moment(dealSubmissionPlus3Months).format('Do MMMM YYYY');
  const minSubmissionPlus3Months = moment(manualInclusionNoticeSubmissionDate).add(3, 'month');
  const minSubmissionPlus3MonthsFormatted = moment(minSubmissionPlus3Months).format('Do MMMM YYYY');

  if (requestedCoverStartDate) {
    if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      if (moment(requestedCoverStartDate).isBefore(dealSubmissionDate, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be after ${formattedDealSubmissionDate}`,
          order: orderNumber(newErrorList),
        };
      }

      // if 3 months after deal submission date
      if (!specialIssuePermission && moment(requestedCoverStartDate).isAfter(dealSubmissionPlus3Months, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedDealSubmissionDate} and ${dealSubmissionPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
    } else if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
      if (moment(requestedCoverStartDate).isBefore(today, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be after ${formattedToday}`,
          order: orderNumber(newErrorList),
        };
      }

      if (manualInclusionNoticeSubmissionDateTimestamp) {
        if (moment(requestedCoverStartDate).isBefore(manualInclusionNoticeSubmissionDate, 'day')) {
          newErrorList.requestedCoverStartDate = {
            text: `Requested Cover Start Date must be after ${formattedManualInclusionNoticeSubmissionDate}`,
            order: orderNumber(newErrorList),
          };
        }
      }

      if (!canEnterDateGreaterThan3Months && moment(requestedCoverStartDate).isBefore(today, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedToday} and ${todayPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }

      if (!canEnterDateGreaterThan3Months && moment(requestedCoverStartDate).isAfter(todayPlus3Months, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedToday} and ${todayPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
    } else if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      if (manualInclusionNoticeSubmissionDateTimestamp) {
        if (moment(requestedCoverStartDate).isBefore(manualInclusionNoticeSubmissionDate, 'day')) {
          newErrorList.requestedCoverStartDate = {
            text: `Requested Cover Start Date must be after ${formattedManualInclusionNoticeSubmissionDate}`,
            order: orderNumber(newErrorList),
          };
        }
      }

      // if 3 months after MIN submission date
      if (!canEnterDateGreaterThan3Months && !specialIssuePermission && moment(requestedCoverStartDate).isAfter(minSubmissionPlus3Months, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedManualInclusionNoticeSubmissionDate} and ${minSubmissionPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
    }
    const { coverDayValidation, coverMonthValidation, coverYearValidation } = coverDatesValidation(
      requestedCoverStartDateDay,
      requestedCoverStartDateMonth,
      requestedCoverStartDateYear,
    );

    if (coverDayValidation.error && requestedCoverStartDateDay) {
      // error object does not exist if no errors in validation
      newErrorList.requestedCoverStartDate = {
        text: 'The day for the requested Cover Start Date must include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }

    if (coverMonthValidation.error && requestedCoverStartDateMonth) {
      // error object does not exist if no errors in validation
      newErrorList.requestedCoverStartDate = {
        text: 'The month for the requested Cover Start Date must include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }

    // error object does not exist if no errors in validation
    if (coverYearValidation.error && requestedCoverStartDateYear) {
      newErrorList.requestedCoverStartDate = {
        text: 'The year for the requested Cover Start Date must include 4 numbers',
        order: orderNumber(newErrorList),
      };
    }
  } else if (dateHasSomeValues(requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear)) {
    newErrorList.requestedCoverStartDate = {
      text: dateValidationText('Requested Cover Start Date', requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear),
      order: orderNumber(newErrorList),
    };
  } else {
    // if cover starts on submission then checks if today past AIN or MIN submission date
    if (!specialIssuePermission && dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      if (moment(today).isAfter(dealSubmissionPlus3Months, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedDealSubmissionDate} and ${dealSubmissionPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
    }

    if (!canEnterDateGreaterThan3Months && !specialIssuePermission && dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      if (moment(today).isAfter(minSubmissionPlus3Months, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedDealSubmissionDate} and ${minSubmissionPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
    }
  }

  return newErrorList;
};
