const { fromUnixTime, format } = require('date-fns');
const { hasValue } = require('../../../../utils/string');
const { formatYear } = require('../../../../utils/date');
const api = require('../../../../v1/api');
const { latestAmendmentCoverEndDateAccepted } = require('../../../helpers/amendment.helpers');

const mapCoverEndDate = async (day, month, year, facilitySnapshot) => {
  const hasCoverEndDate = (hasValue(day)
    && hasValue(month)
    && hasValue(year));

  if (hasCoverEndDate) {
    let dayToUse = day;
    let monthToUse = month;
    let yearToUse = year;

    if (facilitySnapshot) {
      const { _id } = facilitySnapshot;

      const latestCompletedAmendment = await api.getLatestCompletedAmendment(_id);

      if (latestCompletedAmendment?.amendmentId && latestCompletedAmendment?.coverEndDate && latestAmendmentCoverEndDateAccepted(latestCompletedAmendment)) {
        const { coverEndDate } = latestCompletedAmendment;
        // maps new coverEndDate from unix timestamp in amendment
        dayToUse = format(fromUnixTime(coverEndDate), 'dd');
        monthToUse = format(fromUnixTime(coverEndDate), 'MM');
        yearToUse = format(fromUnixTime(coverEndDate), 'yyyy');
      }
    }

    // -1 as months are zero indexed
    const coverEndDate = new Date(formatYear(Number(yearToUse)), Number(monthToUse) - 1, Number(dayToUse));

    return format(coverEndDate, 'd MMMM yyyy');
  }

  return undefined;
};

module.exports = mapCoverEndDate;
