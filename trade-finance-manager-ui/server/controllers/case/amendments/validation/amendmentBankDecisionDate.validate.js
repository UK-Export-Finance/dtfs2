const { set, getUnixTime } = require('date-fns');

const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

/**
 * @param {Object} body
 * @param {String} type
 * @param {String} message
 * @returns {Object}
 * Validation function for effective and received dates on amendment banks decision
 * Used for both received and effective date with type and message passed as string
 * checks that full date has been provided
 * returns errors or epoch received/effective date (with blank errors) in an object
 */

const amendmentBankDecisionDateValidation = async (body, type, message) => {
  const {
    'amendment--bank-decision-date-day': amendmentBankDecisionDateDay,
    'amendment--bank-decision-date-month': amendmentBankDecisionDateMonth,
    'amendment--bank-decision-date-year': amendmentBankDecisionDateYear,
  } = body;

  const amendmentBankDecisionDateErrors = [];

  const amendmentRequestIsFullyComplete = amendmentBankDecisionDateDay && amendmentBankDecisionDateMonth && amendmentBankDecisionDateYear;
  const amendmentRequestIsPartiallyComplete = !amendmentRequestIsFullyComplete
    && (amendmentBankDecisionDateDay || amendmentBankDecisionDateMonth || amendmentBankDecisionDateYear);
  const amendmentRequestIsBlank = !amendmentBankDecisionDateDay && !amendmentBankDecisionDateMonth && !amendmentBankDecisionDateYear;

  let amendmentBankRequestDate = null;

  // if blank or partially filled then push error
  if (amendmentRequestIsBlank || amendmentRequestIsPartiallyComplete) {
    amendmentBankDecisionDateErrors.push({
      errRef: type,
      errMsg: message,
    });
  }

  if (amendmentRequestIsFullyComplete) {
    const amendmentRequestDateFormatted = set(new Date(), {
      year: amendmentBankDecisionDateYear,
      month: amendmentBankDecisionDateMonth - 1,
      date: amendmentBankDecisionDateDay,
    });
    // sets to unix timestamp
    amendmentBankRequestDate = getUnixTime(amendmentRequestDateFormatted);
  }

  const errorsObject = {
    errors: validationErrorHandler(amendmentBankDecisionDateErrors),
    amendmentBankDecisionDateDay,
    amendmentBankDecisionDateMonth,
    amendmentBankDecisionDateYear,
  };

  return {
    amendmentBankRequestDate,
    errorsObject,
    amendmentBankDecisionDateErrors,
  };
};

module.exports = { amendmentBankDecisionDateValidation };
