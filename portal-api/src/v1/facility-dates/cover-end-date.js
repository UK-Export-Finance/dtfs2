const { cloneDeep } = require('lodash');
const { getDateAsEpochMillisecondString, getStartOfDateFromDayMonthYearStringsReplicatingMoment } = require('../helpers/date');
const { dateHasAllValues } = require('../validation/fields/date');

const hasAllCoverEndDateValues = (facility) => {
  const { 'coverEndDate-day': coverEndDateDay, 'coverEndDate-month': coverEndDateMonth, 'coverEndDate-year': coverEndDateYear } = facility;

  if (dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
    return true;
  }

  return false;
};

exports.hasAllCoverEndDateValues = hasAllCoverEndDateValues;

// TODO: DTFS2-7024 remove this dependence on moment behaviour
/**
 * returns facility object with added coverEndDate property, if the day month,
 * year are given. This is stored as a UTC timestamp
 * @param {Object} facility
 * @returns {Object}
 *
 * This function has odd behaviour inherited from moment js:
 *  - If the month is invalid set coverEndDate to NaN
 *  - If the day/year is invalid, use the current day/year instead
 */
const updateCoverEndDate = (facility) => {
  const modifiedFacility = cloneDeep(facility);

  if (hasAllCoverEndDateValues(facility)) {
    const { 'coverEndDate-day': coverEndDateDay, 'coverEndDate-month': coverEndDateMonth, 'coverEndDate-year': coverEndDateYear } = facility;

    modifiedFacility.coverEndDate = getDateAsEpochMillisecondString(
      getStartOfDateFromDayMonthYearStringsReplicatingMoment(coverEndDateDay, coverEndDateMonth, coverEndDateYear),
    );
  }
  return modifiedFacility;
};

exports.updateCoverEndDate = updateCoverEndDate;
