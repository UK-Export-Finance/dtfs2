const moment = require('moment');
const { format } = require('date-fns');
const api = require('../api');
const dateHelpers = require('../../utils/date');

// TODO: DTFS2-6998: remove this function
const getEpoch = (timestamp) => {
  const utc = moment(Number(timestamp));
  const dt = moment(utc);
  return moment(dt).isValid() ? dt.valueOf() : '';
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
      const startDate = getEpoch(coverStartDate);
      const formattedStartDate = format(new Date(startDate), 'yyyy-MM-dd');

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
