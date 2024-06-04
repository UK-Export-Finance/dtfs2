const { parseISO } = require('date-fns');
const api = require('../api');
const { formatDate, formatTimestamp } = require('../../utils/date');

const getFacilityExposurePeriod = async (facility) => {
  try {
    const { type, hasBeenIssued, coverStartDate, coverEndDate } = facility;

    let facilityUpdate;

    if (hasBeenIssued) {
      // coverStartDate is a 13 digit Unix timestamp: the time in ms since 1st January 1970 (UTC)
      const formattedStartDate = formatTimestamp(coverStartDate);

      // coverEndDate is stored as an ISO-8601 timestamp (e.g 2023-01-11T14:30:01.459Z)
      const formattedEndDate = formatDate(parseISO(coverEndDate));

      const exposurePeriodResponse = await api.getFacilityExposurePeriod(formattedStartDate, formattedEndDate, type);

      const { exposurePeriodInMonths } = exposurePeriodResponse;

      facilityUpdate = { exposurePeriodInMonths };
    }

    return facilityUpdate;
  } catch (error) {
    console.error('TFM-API - error calling getFacilityExposurePeriod update-facilities.js %o', error);
    return facility;
  }
};

module.exports = getFacilityExposurePeriod;
