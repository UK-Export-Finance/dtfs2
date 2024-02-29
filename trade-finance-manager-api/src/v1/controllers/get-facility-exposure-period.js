const { format, isValid, toDate, parseISO } = require('date-fns');
const api = require('../api');

const getFacilityExposurePeriod = async (facility) => {
  try {
    const {
      type,
      hasBeenIssued,
      coverStartDate,
      coverEndDate,
    } = facility;

    let facilityUpdate;

    if (hasBeenIssued) {
      // coverStartDate is a 13 digit Unix timestamp: the time in ms since 1st January 1970 (UTC)
      const startDate = toDate(coverStartDate);
      const formattedStartDate = isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : 'Invalid date';

      // coverEndDate is stored as an ISO-8601 timestamp (e.g 2023-01-11T14:30:01.459Z)
      const endDate = parseISO(coverEndDate);
      const formattedEndDate = isValid(endDate) ? format(endDate, 'yyyy-MM-dd') : 'Invalid date';

      const exposurePeriodResponse = await api.getFacilityExposurePeriod(
        formattedStartDate,
        formattedEndDate,
        type,
      );

      const { exposurePeriodInMonths } = exposurePeriodResponse;

      facilityUpdate = { exposurePeriodInMonths };
    }

    return facilityUpdate;
  } catch (error) {
    console.error('TFM-API - error calling getFacilityExposurePeriod update-facilities.js %s', error);
    return facility;
  }
};

module.exports = getFacilityExposurePeriod;
