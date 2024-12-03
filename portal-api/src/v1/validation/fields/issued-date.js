const { isBefore, startOfDay, isAfter } = require('date-fns');
const CONSTANTS = require('../../../constants');
const { orderNumber } = require('../../../utils/error-list-order-number');
const { dateHasAllValues, dateValidationText } = require('./date');
const { getStartOfDateFromEpochMillisecondString, getLongFormattedDate } = require('../../helpers/date');

module.exports = (facility, errorList, deal) => {
  const newErrorList = errorList;

  const { 'issuedDate-day': issuedDateDay, 'issuedDate-month': issuedDateMonth, 'issuedDate-year': issuedDateYear } = facility;

  const { submissionType } = deal;
  const { submissionDate: dealSubmissionDateTimestamp, manualInclusionNoticeSubmissionDate: minSubmissionDateTimestamp } = deal.details;

  const issuedDate = getStartOfDateFromEpochMillisecondString(facility.issuedDate);
  const today = startOfDay(new Date());

  let dealSubmissionDate = startOfDay(new Date());

  if (dealSubmissionDateTimestamp || minSubmissionDateTimestamp) {
    if (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      dealSubmissionDate = getStartOfDateFromEpochMillisecondString(dealSubmissionDateTimestamp);
    } else if (minSubmissionDateTimestamp) {
      dealSubmissionDate = getStartOfDateFromEpochMillisecondString(minSubmissionDateTimestamp);
    }
  }

  const issuedDayHasValues = dateHasAllValues(issuedDateDay, issuedDateMonth, issuedDateYear);

  if (issuedDayHasValues) {
    if (isBefore(issuedDate, dealSubmissionDate)) {
      newErrorList.issuedDate = {
        text: `Issued Date must be on or after ${getLongFormattedDate(dealSubmissionDate)}`,
        order: orderNumber(newErrorList),
      };
    }

    if (isAfter(issuedDate, today)) {
      newErrorList.issuedDate = {
        text: 'Issued Date must be today or in the past',
        order: orderNumber(newErrorList),
      };
    }
  }
  if (!facility.issuedDate && !issuedDayHasValues) {
    newErrorList.issuedDate = {
      text: dateValidationText('Issued Date', issuedDateDay, issuedDateMonth, issuedDateYear),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
