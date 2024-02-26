const moment = require('moment');
const api = require('../api');
const dateHelpers = require('../../utils/date');

// TODO: DTFS2-6998: remove this function
const formattedTimestamp = (timestamp) => {
  const utc = moment(Number(timestamp));
  const dt = moment(utc);
  return moment(dt).isValid() ? dt.format() : '';
};

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
      const startDate = formattedTimestamp(coverStartDate);
      const formattedStartDate = dateHelpers.formatDate(startDate);

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
