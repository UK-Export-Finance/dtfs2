const { isAfter, isBefore, set, getUnixTime } = require('date-fns');
const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');
const amendmentmentYearValidation = require('./amendmentYearValidation.validate');

/**
 *
 * @param {Object} body
 * @param {Object} facility
 * @returns {Object} containing errors and amendment date
 * function to validate the amendment request date
 * checks if in future or before submission date
 */
const amendmentRequestDateValidation = (body, facility) => {
  const {
    'amendment-request-date-day': amendmentRequestDateDay,
    'amendment-request-date-month': amendmentRequestDateMonth,
    'amendment-request-date-year': amendmentRequestDateYear,
  } = body;

  const amendmentRequestDateErrors = [];

  const amendmentRequestIsFullyComplete = amendmentRequestDateDay && amendmentRequestDateMonth && amendmentRequestDateYear;
  const amendmentRequestIsPartiallyComplete = !amendmentRequestIsFullyComplete
    && (amendmentRequestDateDay || amendmentRequestDateMonth || amendmentRequestDateYear);
  const amendmentRequestIsBlank = !amendmentRequestDateDay && !amendmentRequestDateMonth && !amendmentRequestDateYear;

  let amendmentRequestDate = null;

  if (amendmentRequestIsBlank) {
    amendmentRequestDateErrors.push({
      errRef: 'amendmentRequestDate',
      errMsg: 'Enter the date the bank requested the amendment',
    });
  } else if (amendmentRequestIsPartiallyComplete) {
    let msg = 'Amendment request date must include a ';
    const dateFieldsInError = [];
    if (!amendmentRequestDateDay) {
      msg += 'day ';
      dateFieldsInError.push('amendmentRequestDate-day');
    }
    if (!amendmentRequestDateMonth) {
      msg += !amendmentRequestDateDay ? ' and month ' : 'month ';
      dateFieldsInError.push('amendmentRequestDate-month');
    }
    if (!amendmentRequestDateYear) {
      msg += !amendmentRequestDateDay || !amendmentRequestDateMonth ? 'and year' : 'year';
      dateFieldsInError.push('amendmentRequestDate-year');
    }

    amendmentRequestDateErrors.push({
      errRef: 'amendmentRequestDate',
      errMsg: msg,
      subFieldErrorRefs: dateFieldsInError,
    });
  } else if (amendmentRequestIsFullyComplete) {
    // set to midnight to stop mismatch if date in past so set to midnight
    const submissionDate = new Date(Number(facility.facilitySnapshot.dates.inclusionNoticeReceived)).setHours(2, 2, 2, 2);
    const today = new Date();
    let requestDateSet = set(new Date(), { year: amendmentRequestDateYear, month: amendmentRequestDateMonth - 1, date: amendmentRequestDateDay });
    requestDateSet = requestDateSet.setHours(2, 2, 2, 2);
    let yearCorrectFormat = true;

    // if year in wrong format
    if (amendmentmentYearValidation(amendmentRequestDateYear)) {
      yearCorrectFormat = false;
      amendmentRequestDateErrors.push({
        errRef: 'amendmentRequestDate',
        errMsg: 'The year for the amendment request date must include 4 numbers',
      });
    }

    if (yearCorrectFormat) {
    // checks amendment date not in the future
      if (isAfter(requestDateSet, today)) {
        amendmentRequestDateErrors.push({
          errRef: 'amendmentRequestDate',
          errMsg: 'Amendment request date cannot be in the future',
        });
      }

      // checks amendment date not before submission date
      if (isBefore(requestDateSet, submissionDate)) {
        amendmentRequestDateErrors.push({
          errRef: 'amendmentRequestDate',
          errMsg: 'Amendment request date cannot be before the notice submission date',
        });
      }
    }
  }

  if (amendmentRequestIsFullyComplete) {
    const amendmentRequestDateFormatted = set(new Date(), {
      year: amendmentRequestDateYear,
      month: amendmentRequestDateMonth - 1,
      date: amendmentRequestDateDay,
    });
    // sets to unix timestamp
    amendmentRequestDate = getUnixTime(amendmentRequestDateFormatted);
  }

  const errorsObject = {
    errors: validationErrorHandler(amendmentRequestDateErrors),
    amendmentRequestDateDay,
    amendmentRequestDateMonth,
    amendmentRequestDateYear,
  };

  return {
    amendmentRequestDate,
    errorsObject,
    amendmentRequestDateErrors,
  };
};

module.exports = { amendmentRequestDateValidation };
