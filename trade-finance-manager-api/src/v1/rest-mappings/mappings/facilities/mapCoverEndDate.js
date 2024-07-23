const { fromUnixTime, format } = require('date-fns');
const { hasValue } = require('../../../../utils/string');
const { formatYear } = require('../../../../utils/date');
const { findLatestCompletedAmendment } = require('../../helpers/amendment.helpers');

const mapCoverEndDate = (day, month, year, facility) => {
  const hasCoverEndDate = hasValue(day) && hasValue(month) && hasValue(year);
  if (hasCoverEndDate) {
    let dayToUse = day;
    let monthToUse = month;
    let yearToUse = year;

    // if there are amendments present
    if (facility?.amendments?.length) {
      // returns latest completed tfm object from amendment
      const { coverEndDate: latestAmendmentCoverEndDate } = findLatestCompletedAmendment(facility.amendments);
      // if coverEndDate as part of amendment changes
      if (latestAmendmentCoverEndDate) {
        // maps new coverEndDate from unix timestamp in amendment
        dayToUse = format(fromUnixTime(latestAmendmentCoverEndDate), 'dd');
        monthToUse = format(fromUnixTime(latestAmendmentCoverEndDate), 'MM');
        yearToUse = format(fromUnixTime(latestAmendmentCoverEndDate), 'yyyy');
      }
    }

    // -1 as months are zero indexed
    const coverEndDate = new Date(formatYear(Number(yearToUse)), Number(monthToUse) - 1, Number(dayToUse));

    return format(coverEndDate, 'd MMMM yyyy');
  }

  return undefined;
};

module.exports = mapCoverEndDate;
