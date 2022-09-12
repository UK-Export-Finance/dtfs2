const moment = require('moment');
const Joi = require('joi');
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
    manualInclusionNoticeSubmissionDate: manualInclusionNoticeSubmissionDateTimestamp,
  } = deal.details;

  const dealSubmissionDate = formattedTimestamp(dealSubmissionDateTimestamp);
  const requestedCoverStartDate = formattedTimestamp(submittedValues.requestedCoverStartDate);
  const manualInclusionNoticeSubmissionDate = formattedTimestamp(manualInclusionNoticeSubmissionDateTimestamp);

  // EC 15 is: 'Cover Start Date is no more than three months from the date of submission'
  const eligibilityCriteria15 = deal.eligibility.criteria.find((c) => c.id === 15);
  const canEnterDateGreaterThan3Months = eligibilityCriteria15 && eligibilityCriteria15.answer === false;

  if (requestedCoverStartDate) {
    const formattedDealSubmissionDate = moment(dealSubmissionDate).format('Do MMMM YYYY');
    const formattedManualInclusionNoticeSubmissionDate = moment(manualInclusionNoticeSubmissionDate).format('Do MMMM YYYY');

    const today = moment();
    const formattedToday = moment(today).format('Do MMMM YYYY');
    const todayPlus3Months = moment(today).add(3, 'month');
    const todayPlus3MonthsFormatted = moment(todayPlus3Months).format('Do MMMM YYYY');

    if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      if (moment(requestedCoverStartDate).isBefore(dealSubmissionDate, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be after ${formattedDealSubmissionDate}`,
          order: orderNumber(newErrorList),
        };
      }

      if (moment(requestedCoverStartDate).isAfter(todayPlus3Months, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedDealSubmissionDate} and ${todayPlus3MonthsFormatted}`,
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

      if (!canEnterDateGreaterThan3Months && moment(requestedCoverStartDate).isAfter(todayPlus3Months, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedManualInclusionNoticeSubmissionDate} and ${todayPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
    }
    // validates the coverStartDateYear is 4 digits long and only numbers and returns error in validation if not
    const yearSchema = Joi.string().length(4).pattern(/^[0-9]+$/).required();
    const yearValidation = yearSchema.validate(requestedCoverStartDateYear);

    // schema which ensures that coverStart month and day is only numbers and of length 1 or 2
    const coverDayMonthSchema = Joi.string().min(1).max(2).pattern(/^[0-9]+$/);
    const coverStartMonthValidation = coverDayMonthSchema.validate(requestedCoverStartDateMonth);
    const coverStartDayValidation = coverDayMonthSchema.validate(requestedCoverStartDateDay);

    if (coverStartDayValidation.error && requestedCoverStartDateDay) {
      // error object does not exist if no errors in validation
      newErrorList.requestedCoverStartDate = {
        text: 'The day for the requested Cover Start Date must include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }

    if (coverStartMonthValidation.error && requestedCoverStartDateMonth) {
      // error object does not exist if no errors in validation
      newErrorList.requestedCoverStartDate = {
        text: 'The month for the requested Cover Start Date must include 1 or 2 numbers',
        order: orderNumber(newErrorList),
      };
    }

    // error object does not exist if no errors in validation
    if (yearValidation.error && requestedCoverStartDateYear) {
      newErrorList.requestedCoverStartDate = {
        text: 'The year for the requested Cover Start Date must include 4 numbers',
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
