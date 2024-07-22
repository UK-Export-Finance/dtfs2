// eslint-disable-next-line import/no-import-module-exports
import { getHighestPriorityStandardDateErrorMessage } from '@ukef/dtfs2-common';

const { set, getUnixTime, add, isAfter, isBefore, fromUnixTime } = require('date-fns');

/**
 *
 * @param {Object} body
 * @param coverEndDate
 * @returns {Object} containing errors and amendment facility end date
 */

const facilityEndDateValidation = (body, coverEndDate) => {
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
  const coverEndDateCompare = new Date(fromUnixTime(coverEndDate));

  // checks if the current cover end date the same as the new cover end date
  if (isAfter(inputtedDate, sixYearsFromNow)) {
    otherError = {
      errRefs: ['facilityEndDate'],
      errMsg: 'Facility end date cannot be greater than 6 years in the future',
    };
  } else if (isBefore(inputtedDate, coverEndDateCompare)) {
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

  const facilityEndFormatted = set(new Date(), {
    year: facilityEndYear,
    month: facilityEndMonth - 1,
    date: facilityEndDay,
  });

  const facilityEndDate = getUnixTime(facilityEndFormatted);

  return {
    facilityEndDate,
    errorsObject: {},
  };
};

module.exports = { facilityEndDateValidation };
