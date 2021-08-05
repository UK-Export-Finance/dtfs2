const api = require('../api');
const formattedTimestamp = require('../formattedTimestamp');
const dateHelpers = require('../../utils/date');

const getFacilityExposurePeriod = async (facility) => {
  const {
    facilityType,
    hasBeenIssued,
    coverStartDate,
    coverEndDate,
  } = facility;

  let facilityUpdate;

  if (hasBeenIssued) {
    const startDate = formattedTimestamp(coverStartDate);

    const formattedStartDate = dateHelpers.formatDate(startDate, 'YYYY-MM-DD');

    const formattedEndDate = dateHelpers.formatDate(coverEndDate, 'YYYY-MM-DD');

    const exposurePeriodResponse = await api.getFacilityExposurePeriod(
      formattedStartDate,
      formattedEndDate,
      facilityType,
    );

    const { exposurePeriodInMonths } = exposurePeriodResponse;

    facilityUpdate = { exposurePeriodInMonths };
  }

  return facilityUpdate;
};

module.exports = getFacilityExposurePeriod;
