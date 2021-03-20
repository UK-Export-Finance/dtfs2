/* calculating exposure period based on Portal V2 algorithm */
const moment = require('moment');
const { formatYear, formatTimestamp } = require('../../../helpers/date');

const getExposurePeriod = (facility) => {
  let coverStartDate;
  const { facilitySnapshot } = facility;

  if (facilitySnapshot.requestedCoverStartDate) {
    const startDate = moment(formatTimestamp(facilitySnapshot.requestedCoverStartDate));

    // Need a date without the h:m:s elements as this effects the diff calculation
    coverStartDate = moment([
      formatYear(startDate.year()),
      startDate.month(),
      startDate.date(),
    ]);
  } else {
    coverStartDate = moment([
      formatYear(facilitySnapshot['requestedCoverStartDate-year']),
      facilitySnapshot['requestedCoverStartDate-month'] - 1,
      facilitySnapshot['requestedCoverStartDate-day'],
    ]);
  }

  const coverEndDate = moment([
    formatYear(facilitySnapshot['coverEndDate-year']),
    facilitySnapshot['coverEndDate-month'] - 1,
    facilitySnapshot['coverEndDate-day'],
  ]);

  if (!coverStartDate.isValid() || !coverEndDate.isValid()) {
    return facilitySnapshot.ukefGuaranteeInMonths;
  }


  const durationMonths = coverEndDate.diff(coverStartDate, 'months') + 1;

  const monthOffset = moment(coverStartDate).date() === moment(coverEndDate).date() ? -1 : 0;


  return durationMonths + monthOffset;
};


module.exports = getExposurePeriod;
