const { format, toDate } = require('date-fns');
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
      const formattedStartDate = format(toDate(coverStartDate), 'yyyy-MM-dd');

      const formattedEndDate = format(toDate(coverEndDate), 'yyyy-MM-dd');

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
