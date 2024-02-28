const { format, isValid } = require('date-fns');
const api = require('../api');
const dateHelpers = require('../../utils/date');

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
      const startDate = new Date(Number(coverStartDate));
      const formattedStartDate = isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : 'Invalid date';

      const formattedEndDate = dateHelpers.formatDate(coverEndDate);

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
