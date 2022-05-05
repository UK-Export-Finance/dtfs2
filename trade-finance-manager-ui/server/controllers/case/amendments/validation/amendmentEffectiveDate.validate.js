const {
  isAfter, set, getUnixTime,
} = require('date-fns');
const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

/**
 *
 * @param {Object} body
 * @param {Object} facility
 * @returns {Object} containing errors and amendment date
 * function to validate the amendment effective date
 * checks if in future or before submission date
 */
const amendmentEffectiveDateValidation = async (body) => {
  const {
    'amendment-effective-date-day': amendmentEffectiveDateDay,
    'amendment-effective-date-month': amendmentEffectiveDateMonth,
    'amendment-effective-date-year': amendmentEffectiveDateYear,
  } = body;

  const amendmentEffectiveDateErrors = [];

  const amendmentEffectiveIsFullyComplete = amendmentEffectiveDateDay && amendmentEffectiveDateMonth && amendmentEffectiveDateYear;
  const amendmentEffectiveIsPartiallyComplete = !amendmentEffectiveIsFullyComplete
    && (amendmentEffectiveDateDay || amendmentEffectiveDateMonth || amendmentEffectiveDateYear);
  const amendmentEffectiveIsBlank = !amendmentEffectiveDateDay && !amendmentEffectiveDateMonth && !amendmentEffectiveDateYear;

  let amendmentEffectiveDate = null;

  if (amendmentEffectiveIsBlank) {
    amendmentEffectiveDateErrors.push({
      errRef: 'amendmentEffectiveDate',
      errMsg: 'Enter the date the amendment is effective from',
    });
  } else if (amendmentEffectiveIsPartiallyComplete) {
    let msg = 'Amendment effective date must include a ';
    const dateFieldsInError = [];
    if (!amendmentEffectiveDateDay) {
      msg += 'day ';
      dateFieldsInError.push('amendmentEffectiveDate-day');
    }
    if (!amendmentEffectiveDateMonth) {
      msg += !amendmentEffectiveDateDay ? ' and month ' : 'month ';
      dateFieldsInError.push('amendmentEffectiveDate-month');
    }
    if (!amendmentEffectiveDateYear) {
      msg += !amendmentEffectiveDateDay || !amendmentEffectiveDateMonth ? 'and year' : 'year';
      dateFieldsInError.push('amendmentEffectiveDate-year');
    }

    amendmentEffectiveDateErrors.push({
      errRef: 'amendmentEffectiveDate',
      errMsg: msg,
      subFieldErrorRefs: dateFieldsInError,
    });
  } else if (amendmentEffectiveIsFullyComplete) {
    const today = new Date();
    let effectiveDateSet = set(new Date(), { year: amendmentEffectiveDateYear, month: amendmentEffectiveDateMonth - 1, date: amendmentEffectiveDateDay });
    effectiveDateSet = effectiveDateSet.setHours(2, 2, 2, 2);

    // checks amendment date not in the future
    if (isAfter(effectiveDateSet, today)) {
      amendmentEffectiveDateErrors.push({
        errRef: 'amendmentEffectiveDate',
        errMsg: 'The date the amendment is effective from must be today or in the future',
      });
    }
  }

  if (amendmentEffectiveIsFullyComplete) {
    const amendmentEffectiveDateFormatted = set(new Date(), {
      year: amendmentEffectiveDateYear,
      month: amendmentEffectiveDateMonth - 1,
      date: amendmentEffectiveDateDay,
    });
    // sets to unix timestamp
    amendmentEffectiveDate = getUnixTime(amendmentEffectiveDateFormatted);
  }

  const errorsObject = {
    errors: validationErrorHandler(amendmentEffectiveDateErrors),
    amendmentEffectiveDateDay,
    amendmentEffectiveDateMonth,
    amendmentEffectiveDateYear,
  };

  return {
    amendmentEffectiveDate,
    errorsObject,
    amendmentEffectiveDateErrors,
  };
};

module.exports = { amendmentEffectiveDateValidation };
