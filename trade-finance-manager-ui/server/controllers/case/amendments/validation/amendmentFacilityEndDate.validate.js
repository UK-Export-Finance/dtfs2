// eslint-disable-next-line import/no-import-module-exports
import { getHighestPriorityStandardDateErrorMessage } from '@ukef/dtfs2-common';

const { set, add, isAfter, isBefore, fromUnixTime } = require('date-fns');

/**
 *
 * @param {Object} body
 * @param coverStartDate
 * @returns {Object} containing errors and amendment facility end date
 */

const facilityEndDateValidation = (body, coverStartDate) => {
  const { 'facility-end-date-day': facilityEndDay, 'facility-end-date-month': facilityEndMonth, 'facility-end-date-year': facilityEndYear } = body;
  const standardDateError = getHighestPriorityStandardDateErrorMessage(
    'Facility end date',
    'facilityEndDate',
    facilityEndDay,
    facilityEndMonth,
    facilityEndYear,
  );

  if (standardDateError) {
    const errorsObject = {
      errors: { summary: [{ text: standardDateError.errMsg }], fields: standardDateError.errRefs },
      facilityEndDay,
      facilityEndMonth,
      facilityEndYear,
    };

    return { facilityEndDate: undefined, errorsObject };
  }

  let otherError;
  const inputtedDate = set(new Date(), { year: facilityEndYear, month: facilityEndMonth - 1, date: facilityEndDay });
  const now = new Date();
  const sixYearsFromNow = add(now, { years: 6 });
  const coverStartDateToCompare = new Date(Number(coverStartDate));

  // checks if the entered facility end date is greater than 6 years in the future
  if (isAfter(inputtedDate, sixYearsFromNow)) {
    otherError = {
      errRefs: ['facilityEndDate'],
      errMsg: 'Facility end date cannot be greater than 6 years in the future',
    };
  }
  // checks if the entered facility end date is before the cover start date
  else if (isBefore(inputtedDate, coverStartDateToCompare)) {
    otherError = {
      errRefs: ['facilityEndDate'],
      errMsg: 'The facility end date cannot be before the cover start date',
    };
  }

  if (otherError) {
    const errorsObject = {
      errors: { summary: [{ text: otherError.errMsg }], fields: otherError.errRefs },
      facilityEndDay,
      facilityEndMonth,
      facilityEndYear,
    };

    return { facilityEndDate: undefined, errorsObject };
  }

  const facilityEndDate = set(new Date(), {
    year: facilityEndYear,
    month: facilityEndMonth - 1,
    date: facilityEndDay,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }).toISOString();

  return {
    facilityEndDate,
    errorsObject: {},
  };
};

module.exports = facilityEndDateValidation;
