const { format, isValid, toDate } = require('date-fns');
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
      const startDate = toDate(coverStartDate);
      const formattedStartDate = isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : 'Invalid date';

      console.log({ testCoverEndDate: coverEndDate });
      const endDate = new Date(coverEndDate);
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
