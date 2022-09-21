const moment = require('moment');
const { hasValue } = require('../../utils/string');

const getCoverEndDateValues = (facility) => {
  const {
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
  } = facility;

  return {
    coverEndDateDay,
    coverEndDateMonth,
    coverEndDateYear,
  };
};

const hasAllCoverEndDateValues = (facility) => {
  const {
    coverEndDateDay,
    coverEndDateMonth,
    coverEndDateYear,
  } = getCoverEndDateValues(facility);

  const hasCoverEndDate = (hasValue(coverEndDateDay)
    && hasValue(coverEndDateMonth)
    && hasValue(coverEndDateYear));

  if (hasCoverEndDate) {
    return true;
  }

  return false;
};

exports.hasAllCoverEndDateValues = hasAllCoverEndDateValues;

const updateCoverEndDate = (facility) => {
  // if we have all requestedCoverStartDate fields (day, month and year)
  // generate UTC timestamp in a single requestedCoverStartDate property.
  const modifiedFacility = facility;

  if (hasAllCoverEndDateValues(facility)) {
    const {
      coverEndDateDay,
      coverEndDateMonth,
      coverEndDateYear,
    } = getCoverEndDateValues(facility);

    const momentDate = moment().set({
      date: Number(coverEndDateDay),
      month: Number(coverEndDateMonth) - 1, // months are zero indexed
      year: Number(coverEndDateYear),
    });

    modifiedFacility.coverEndDate = moment(momentDate).utc().valueOf().toString();
  }
  return modifiedFacility;
};

exports.updateCoverEndDate = updateCoverEndDate;
