const { startOfDay, isBefore } = require('date-fns');
const { orderNumber } = require('../../../utils/error-list-order-number');
const CONSTANTS = require('../../../constants');
const { getStartOfDateFromEpochMillisecondString } = require('../../helpers/date');

const facilityReadyForCheckRequestedCoverStartDateRule = (deal, facility, errorList) => {
  const { status } = facility;
  const { details, submissionType } = deal;
  const { submissionDate, manualInclusionNoticeSubmissionDate } = details;
  let dateOfSubmission = new Date();
  const newErrorList = errorList;

  if (submissionDate || manualInclusionNoticeSubmissionDate) {
    if (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      dateOfSubmission = getStartOfDateFromEpochMillisecondString(submissionDate);
    } else if (manualInclusionNoticeSubmissionDate) {
      dateOfSubmission = getStartOfDateFromEpochMillisecondString(manualInclusionNoticeSubmissionDate);
    }
  }

  if (facility.requestedCoverStartDate) {
    if (status === CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL) {
      const requestedCoverStartDate = getStartOfDateFromEpochMillisecondString(facility.requestedCoverStartDate);

      if (isBefore(requestedCoverStartDate, startOfDay(dateOfSubmission))) {
        newErrorList.requestedCoverStartDate = {
          text: 'Requested Cover Start Date must be on the application submission date or in the future',
          order: orderNumber(newErrorList),
        };
      }
    }
  }

  return newErrorList;
};

module.exports = (deal, facility) => {
  let errorList = {};

  errorList = facilityReadyForCheckRequestedCoverStartDateRule(deal, facility, errorList);

  return errorList;
};
