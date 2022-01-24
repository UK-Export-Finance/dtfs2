const api = require('../api');
const formattedTimestamp = require('../formattedTimestamp');
const dateHelpers = require('../../utils/date');

const getFacilityExposurePeriod = async (facility) => {
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
};

module.exports = getFacilityExposurePeriod;
