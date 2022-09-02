const moment = require('moment');
const { hasValue } = require('../../utils/string');

const getRequestedCoverStartDateValues = (facility) => {
  const {
    'requestedCoverStartDate-day': requestedCoverStartDateDay,
    'requestedCoverStartDate-month': requestedCoverStartDateMonth,
    'requestedCoverStartDate-year': requestedCoverStartDateYear,
  } = facility;

  return {
    requestedCoverStartDateDay,
    requestedCoverStartDateMonth,
    requestedCoverStartDateYear,
  };
};

const hasAllRequestedCoverStartDateValues = (facility) => {
  const { requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear } = getRequestedCoverStartDateValues(facility);

  const hasRequestedCoverStartDate = hasValue(requestedCoverStartDateDay) && hasValue(requestedCoverStartDateMonth) && hasValue(requestedCoverStartDateYear);

  return hasRequestedCoverStartDate;
};

exports.hasAllRequestedCoverStartDateValues = hasAllRequestedCoverStartDateValues;

exports.updateRequestedCoverStartDate = (facility) => {
  // if we have all requestedCoverStartDate fields (day, month and year)
  // generate UTC timestamp in a single requestedCoverStartDate property.
  const modifiedFacility = facility;

  if (hasAllRequestedCoverStartDateValues(facility)) {
    const { requestedCoverStartDateDay, requestedCoverStartDateMonth, requestedCoverStartDateYear } = getRequestedCoverStartDateValues(facility);

    const momentDate = moment().set({
      date: Number(requestedCoverStartDateDay),
      month: Number(requestedCoverStartDateMonth) - 1, // months are zero indexed
      year: Number(requestedCoverStartDateYear),
    });

    modifiedFacility.requestedCoverStartDate = moment(momentDate).utc().valueOf().toString();
  }
  return modifiedFacility;
};
