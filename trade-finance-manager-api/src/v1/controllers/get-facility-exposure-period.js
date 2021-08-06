const moment = require('moment');
const api = require('../api');
const formattedTimestamp = require('../formattedTimestamp');

const facilityIsIssued = (facilityStage) => (facilityStage === 'Issued' || facilityStage === 'Unconditional');

const getFacilityExposurePeriod = async (facility) => {
  const {
    facilityType,
    facilityStage,
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
    coverStartDate,
  } = facility;

  let facilityUpdate;

  if (facilityIsIssued(facilityStage)) {
    const startDate = formattedTimestamp(coverStartDate);

    const formattedStartDate = moment.utc(startDate).format('YYYY-MM-DD');

    const endDate = moment().set({
      date: Number(coverEndDateDay),
      month: Number(coverEndDateMonth) - 1, // months are zero indexed
      year: Number(coverEndDateYear),
    });

    const formattedEndDate = moment(endDate).format('YYYY-MM-DD');

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
