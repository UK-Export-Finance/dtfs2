const { cloneDeep } = require('lodash');
const { dateHasAllValues } = require('../validation/fields/date');
const { getDateAsEpochMillisecondString, getStartOfDateFromDayMonthYearStringsReplicatingMoment } = require('../helpers/date');

const hasAllRequestedCoverStartDateValues = (facility) => {
  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = facility;

  return dateHasAllValues(requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear);
};

exports.hasAllRequestedCoverStartDateValues = hasAllRequestedCoverStartDateValues;

// TODO: DTFS2-7024 remove this dependence on moment behaviour
/**
 * Returns facility object with added requestedCoverStartDate property, if the day
 * month, year are given. This is stored as a UTC timestamp
 * @param {Object} facility
 * @returns {Object}
 *
 * This function has odd behaviour inherited from moment js
 *  - If the month is invalid set requestedCoverStartDate to NaN
 *  - If the day/year is invalid, use the current day/year instead
 */
exports.updateRequestedCoverStartDate = (facility) => {
  const modifiedFacility = cloneDeep(facility);

  if (hasAllRequestedCoverStartDateValues(facility)) {
    const {
      'requestedCoverStartDate-day': requestedCoverStartDateDay,
      'requestedCoverStartDate-month': requestedCoverStartDateMonth,
      'requestedCoverStartDate-year': requestedCoverStartDateYear,
    } = facility;

    modifiedFacility.requestedCoverStartDate = getDateAsEpochMillisecondString(
      getStartOfDateFromDayMonthYearStringsReplicatingMoment(requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear),
    );
    modifiedFacility.coverDateConfirmed = true;
  }
  return modifiedFacility;
};
