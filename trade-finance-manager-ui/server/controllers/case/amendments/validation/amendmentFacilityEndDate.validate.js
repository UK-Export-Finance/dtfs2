const { isSameDay, set, getUnixTime } = require('date-fns');
const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');
const amendmentYearValidation = require('./amendmentYearValidation.validate');

/**
 *
 * @param {Object} body
 * @param currentFacilityEndDate
 * @returns {Object} containing errors and amendment facility end date
 * function to validate the amendment facility end date
 */
const facilityEndDateValidation = (body) => {
  const { 'facility-end-date-day': facilityEndDay, 'facility-end-date-month': facilityEndMonth, 'facility-end-date-year': facilityEndYear } = body;

  const facilityEndDateErrors = [];
  let facilityEndDate = null;

  if (!facilityEndDay || !facilityEndMonth || !facilityEndYear) {
    facilityEndDateErrors.push({
      errRef: 'facilityEndDate',
      errMsg: 'Enter the new facility end date',
    });
  }

  if (facilityEndDay && facilityEndMonth && facilityEndYear) {
    // const newfacilityEnd = set(new Date(), { year: facilityEndYear, month: facilityEndMonth - 1, date: facilityEndDay });

    // checks if the current facility end date the same as the new facility end date
    // if (isSameDay(newfacilityEnd, new Date(currentFacilityEndDate))) {
    //   facilityEndDateErrors.push({
    //     errRef: 'facilityEndDate',
    //     errMsg: 'The new facility end date cannot be the same as the current facility end date',
    //   });
    // }
    // if year in wrong format
    if (amendmentYearValidation(facilityEndYear)) {
      facilityEndDateErrors.push({
        errRef: 'facilityEndDate',
        errMsg: 'The year for the amendment facility end date must include 4 numbers',
      });
    }
  }

  if (facilityEndDay && facilityEndMonth && facilityEndYear) {
    const facilityEndFormatted = set(new Date(), {
      year: facilityEndYear,
      month: facilityEndMonth - 1,
      date: facilityEndDay,
    });
    facilityEndDate = getUnixTime(facilityEndFormatted);
  }

  const errorsObject = {
    errors: validationErrorHandler(facilityEndDateErrors),
    facilityEndDay,
    facilityEndMonth,
    facilityEndYear,
  };

  return {
    facilityEndDate,
    errorsObject,
    facilityEndDateErrors,
  };
};

module.exports = { facilityEndDateValidation };
