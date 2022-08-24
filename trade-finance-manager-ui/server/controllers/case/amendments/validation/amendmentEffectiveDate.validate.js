const { set, getUnixTime } = require('date-fns');
const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

/**
 *
 * @param {Object} body
 * @param {Object} facility
 * @returns {Object} containing errors and amendment date
 * function to validate the amendment effective date
 * checks if in future or before submission date
 */
const effectiveDateValidation = async (body) => {
  const {
    'amendment-effective-date-day': effectiveDateDay,
    'amendment-effective-date-month': effectiveDateMonth,
    'amendment-effective-date-year': effectiveDateYear,
  } = body;

  const effectiveDateErrors = [];

  const amendmentEffectiveIsFullyComplete = effectiveDateDay && effectiveDateMonth && effectiveDateYear;
  const amendmentEffectiveIsPartiallyComplete = !amendmentEffectiveIsFullyComplete
    && (effectiveDateDay || effectiveDateMonth || effectiveDateYear);
  const amendmentEffectiveIsBlank = !effectiveDateDay && !effectiveDateMonth && !effectiveDateYear;

  let effectiveDate = null;

  if (amendmentEffectiveIsBlank) {
    effectiveDateErrors.push({
      errRef: 'effectiveDate',
      errMsg: 'Enter the date the amendment is effective from',
    });
  } else if (amendmentEffectiveIsPartiallyComplete) {
    let msg = 'Amendment effective date must include a ';
    const dateFieldsInError = [];
    if (!effectiveDateDay) {
      msg += 'day ';
      dateFieldsInError.push('effectiveDate-day');
    }
    if (!effectiveDateMonth) {
      msg += !effectiveDateDay ? ' and month ' : 'month ';
      dateFieldsInError.push('effectiveDate-month');
    }
    if (!effectiveDateYear) {
      msg += !effectiveDateDay || !effectiveDateMonth ? 'and year' : 'year';
      dateFieldsInError.push('effectiveDate-year');
    }

    effectiveDateErrors.push({
      errRef: 'effectiveDate',
      errMsg: msg,
      subFieldErrorRefs: dateFieldsInError,
    });
  }

  if (amendmentEffectiveIsFullyComplete) {
    const effectiveDateFormatted = set(new Date(), {
      year: effectiveDateYear,
      month: effectiveDateMonth - 1,
      date: effectiveDateDay,
    });
    // sets to unix timestamp
    effectiveDate = getUnixTime(effectiveDateFormatted);
  }

  const errorsObject = {
    errors: validationErrorHandler(effectiveDateErrors),
    effectiveDateDay,
    effectiveDateMonth,
    effectiveDateYear,
  };

  return {
    effectiveDate,
    errorsObject,
    effectiveDateErrors,
  };
};

module.exports = { effectiveDateValidation };
