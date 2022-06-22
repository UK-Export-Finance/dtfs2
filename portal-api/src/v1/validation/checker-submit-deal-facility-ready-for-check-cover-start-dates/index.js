const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number');
const { formattedTimestamp } = require('../../facility-dates/timestamp');
const CONSTANTS = require('../../../constants');

const facilityReadyForCheckRequestedCoverStartDateRule = (deal, facility, errorList) => {
  const {
    requestedCoverStartDate,
    status,
  } = facility;
  const { details, submissionType } = deal;
  const { submissionDate, manualInclusionNoticeSubmissionDate } = details;
  let dateOfSubmission = moment().utc().valueOf();
  const newErrorList = errorList;

  if (submissionDate || manualInclusionNoticeSubmissionDate) {
    if (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN) {
      dateOfSubmission = submissionDate;
    } else if (manualInclusionNoticeSubmissionDate) {
      dateOfSubmission = manualInclusionNoticeSubmissionDate;
    }
  }

  if (requestedCoverStartDate) {
    if (status === CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL) {
      const requestedCoverStartDateTimestamp = formattedTimestamp(facility.requestedCoverStartDate);
      const submissionDateFormatted = formattedTimestamp(dateOfSubmission);

      if (moment(requestedCoverStartDateTimestamp).isBefore(submissionDateFormatted, 'day')) {
        newErrorList.requestedCoverStartDate = {
          text: 'Requested Cover Start Date must be on the application submission date or in the future',
          order: orderNumber(newErrorList),
        };
      }
    }
  }

  return newErrorList;
};

module.exports = (
  deal,
  facility,
) => {
  let errorList = {};

  errorList = facilityReadyForCheckRequestedCoverStartDateRule(
    deal,
    facility,
    errorList,
  );

  return errorList;
};
