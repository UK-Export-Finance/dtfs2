const { applyStandardValidationAndParseDateInput } = require('@ukef/dtfs2-common');
const { add, isAfter, isBefore, startOfDay } = require('date-fns');

/**
 * @param {{day: string, month: string, year: string}}
 * @param {Date} coverStartDate
 * @returns {object} containing errors and amendment facility end date
 */

const facilityEndDateValidation = ({ day, month, year }, coverStartDate) => {
  const { error: standardError, parsedDate } = applyStandardValidationAndParseDateInput({ day, month, year }, 'facility end date', 'facility-end-date');

  if (standardError) {
    return {
      error: {
        summary: [{ text: standardError.message }],
        fields: standardError.fieldRefs,
      },
    };
  }

  const today = startOfDay(new Date());
  const sixYearsFromToday = add(today, { years: 6 });
  const coverStartDateToCompare = startOfDay(coverStartDate);

  // checks if the entered facility end date is greater than 6 years in the future
  if (isAfter(parsedDate, sixYearsFromToday)) {
    return {
      error: {
        summary: [{ text: 'Facility end date cannot be greater than 6 years in the future' }],
        fields: ['facility-end-date-day', 'facility-end-date-month', 'facility-end-date-year'],
      },
    };
  }

  // checks if the entered facility end date is before the cover start date
  if (isBefore(parsedDate, coverStartDateToCompare)) {
    return {
      error: {
        summary: [{ text: 'The facility end date cannot be before the cover start date' }],
        fields: ['facility-end-date-day', 'facility-end-date-month', 'facility-end-date-year'],
      },
    };
  }

  return {
    facilityEndDate: parsedDate,
    error: null,
  };
};

module.exports = facilityEndDateValidation;
