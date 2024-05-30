const { isBefore, add, startOfDay, isAfter } = require('date-fns');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const { dateValidationText, dateHasSomeValues } = require('../date');
const CONSTANTS = require('../../../../constants');
const coverDatesValidation = require('../../helpers/coverDatesValidation.helpers');
const { getStartOfDateFromEpochMillisecondString, getLongFormattedDate } = require('../../../helpers/date');

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

  const dealSubmissionDate = getStartOfDateFromEpochMillisecondString(dealSubmissionDateTimestamp);
  const requestedCoverStartDate = getStartOfDateFromEpochMillisecondString(submittedValues.requestedCoverStartDate);
  const manualInclusionNoticeSubmissionDate = getStartOfDateFromEpochMillisecondString(manualInclusionNoticeSubmissionDateTimestamp);
  // EC 15 is: 'Cover Start Date is no more than three months from the date of submission'
  const eligibilityCriteria15 = deal.eligibility.criteria.find((c) => c.id === 15);
  const canEnterDateGreaterThan3Months = eligibilityCriteria15 && eligibilityCriteria15.answer === false;

  const today = startOfDay(new Date());
  const formattedToday = getLongFormattedDate(today);
  const todayPlus3Months = add(today, { months: 3 });
  const todayPlus3MonthsFormatted = getLongFormattedDate(todayPlus3Months);

  const dealSubmissionPlus3Months = add(dealSubmissionDate, { months: 3 });
  const minSubmissionPlus3Months = add(manualInclusionNoticeSubmissionDate, { months: 3 });

  if (submittedValues.requestedCoverStartDate) {
    if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      if (isBefore(requestedCoverStartDate, dealSubmissionDate)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be after ${getLongFormattedDate(dealSubmissionDate)}`,
          order: orderNumber(newErrorList),
        };
      }

      // if 3 months after deal submission date
      if (!specialIssuePermission && isAfter(requestedCoverStartDate, dealSubmissionPlus3Months)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${getLongFormattedDate(dealSubmissionDate)} and ${getLongFormattedDate(dealSubmissionPlus3Months)}`,
          order: orderNumber(newErrorList),
        };
      }
    } else if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
      if (isBefore(requestedCoverStartDate, today)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be after ${formattedToday}`,
          order: orderNumber(newErrorList),
        };
      }

      if (manualInclusionNoticeSubmissionDateTimestamp) {
        if (isBefore(requestedCoverStartDate, manualInclusionNoticeSubmissionDate)) {
          newErrorList.requestedCoverStartDate = {
            text: `Requested Cover Start Date must be after ${getLongFormattedDate(manualInclusionNoticeSubmissionDate)}`,
            order: orderNumber(newErrorList),
          };
        }
      }

      if (!canEnterDateGreaterThan3Months && isBefore(requestedCoverStartDate, today)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedToday} and ${todayPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }

      if (!canEnterDateGreaterThan3Months && isAfter(requestedCoverStartDate, todayPlus3Months)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${formattedToday} and ${todayPlus3MonthsFormatted}`,
          order: orderNumber(newErrorList),
        };
      }
    } else if (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      if (manualInclusionNoticeSubmissionDateTimestamp) {
        if (isBefore(requestedCoverStartDate, manualInclusionNoticeSubmissionDate)) {
          newErrorList.requestedCoverStartDate = {
            text: `Requested Cover Start Date must be after ${getLongFormattedDate(manualInclusionNoticeSubmissionDate)}`,
            order: orderNumber(newErrorList),
          };
        }
      }

      // if 3 months after MIN submission date
      if (!canEnterDateGreaterThan3Months && !specialIssuePermission && isAfter(requestedCoverStartDate, minSubmissionPlus3Months)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${getLongFormattedDate(manualInclusionNoticeSubmissionDate)} and ${getLongFormattedDate(
            minSubmissionPlus3Months,
          )}`,
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
      if (isAfter(today, dealSubmissionPlus3Months)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${getLongFormattedDate(dealSubmissionDate)} and ${getLongFormattedDate(dealSubmissionPlus3Months)}`,
          order: orderNumber(newErrorList),
        };
      }
    }

    if (!canEnterDateGreaterThan3Months && !specialIssuePermission && dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      if (isAfter(today, minSubmissionPlus3Months)) {
        newErrorList.requestedCoverStartDate = {
          text: `Requested Cover Start Date must be between ${getLongFormattedDate(dealSubmissionDate)} and ${getLongFormattedDate(minSubmissionPlus3Months)}`,
          order: orderNumber(newErrorList),
        };
      }
    }
  }

  return newErrorList;
};
