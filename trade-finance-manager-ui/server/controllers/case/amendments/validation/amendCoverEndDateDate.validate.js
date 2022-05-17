const { isSameDay, set, getUnixTime } = require('date-fns');
const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

/**
 *
 * @param {Object} body
 * @param {Object} facility
 * @returns {Object} containing errors and amendment cover end date
 * function to validate the amendment cover end date
 */
const coverEndDateValidation = async (body, currentEndDate) => {
  const { 'cover-end-date-day': coverEndDay, 'cover-end-date-month': coverEndMonth, 'cover-end-date-year': coverEndYear } = body;

  const coverEndDateErrors = [];
  let coverEndDate = null;

  if (!coverEndDay && !coverEndMonth && !coverEndYear) {
    coverEndDateErrors.push({
      errRef: 'coverEndDate',
      errMsg: 'Enter the new cover end date',
    });
  }

  if (coverEndDay && coverEndMonth && coverEndYear) {
    const newCoverEnd = set(new Date(), { year: coverEndYear, month: coverEndMonth - 1, date: coverEndDay });

    // checks if the current cover end date the same as the new cover end date
    if (isSameDay(newCoverEnd, new Date(currentEndDate))) {
      coverEndDateErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'The new cover end date cannot be the same as the current cover end date',
      });
    }
  }

  if (coverEndDay && coverEndMonth && coverEndYear) {
    const coverEndFormatted = set(new Date(), {
      year: coverEndYear,
      month: coverEndMonth - 1,
      date: coverEndDay,
    });
    coverEndDate = getUnixTime(coverEndFormatted);
  }

  const errorsObject = {
    errors: validationErrorHandler(coverEndDateErrors),
    coverEndDay,
    coverEndMonth,
    coverEndYear,
  };

  return {
    coverEndDate,
    errorsObject,
    coverEndDateErrors,
  };
};

module.exports = { coverEndDateValidation };
