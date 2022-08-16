const { fromUnixTime, format } = require('date-fns');
const { hasValue } = require('../../../../utils/string');
const { formatYear } = require('../../../../utils/date');
const { findLatestCompletedAmendment } = require('../../../helpers/amendment.helpers');

const mapCoverEndDate = (day, month, year, facility) => {
  const hasCoverEndDate = (hasValue(day) && hasValue(month) && hasValue(year));
  if (hasCoverEndDate) {
    let dayToUse = day;
    let monthToUse = month;
    let yearToUse = year;

    if (facility?.amendments?.length > 0) {
      const latestAmendmentTFM = findLatestCompletedAmendment(facility.amendments);

      if (latestAmendmentTFM?.coverEndDate) {
        const { coverEndDate } = latestAmendmentTFM;

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
