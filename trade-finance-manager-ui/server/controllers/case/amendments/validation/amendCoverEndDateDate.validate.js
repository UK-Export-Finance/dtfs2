const { isSameDay, set } = require('date-fns');
const { getEpochMs } = require('@ukef/dtfs2-common');
const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');
const amendmentYearValidation = require('./amendmentYearValidation.validate');

/**
 *
 * @param {object} body
 * @param {object} facility
 * @returns {object} containing errors and amendment cover end date
 * function to validate the amendment cover end date
 */
const coverEndDateValidation = (body, currentEndDate) => {
  const { 'cover-end-date-day': coverEndDay, 'cover-end-date-month': coverEndMonth, 'cover-end-date-year': coverEndYear } = body;

  const coverEndDateErrors = [];
  let coverEndDate = null;

  if (!coverEndDay || !coverEndMonth || !coverEndYear) {
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
    // if year in wrong format
    if (amendmentYearValidation(coverEndYear)) {
      coverEndDateErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'The year for the amendment cover end date must include 4 numbers',
      });
    }
  }

  if (coverEndDay && coverEndMonth && coverEndYear) {
    const coverEndFormatted = set(new Date(), {
      year: coverEndYear,
      month: coverEndMonth - 1,
      date: coverEndDay,
    });
    coverEndDate = getEpochMs(coverEndFormatted);
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
