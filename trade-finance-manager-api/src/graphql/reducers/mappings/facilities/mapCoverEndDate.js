const moment = require('moment');
const { hasValue } = require('../../../../utils/string');
const { formatYear } = require('../../../../utils/date');

const mapCoverEndDate = (facility) => {
  const {
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
  } = facility;

  const hasCoverEndDate = (hasValue(coverEndDateDay)
    && hasValue(coverEndDateMonth)
    && hasValue(coverEndDateYear));

  if (hasCoverEndDate) {
    const coverEndDate = moment().set({
      date: Number(coverEndDateDay),
      month: Number(coverEndDateMonth) - 1, // months are zero indexed
      year: formatYear(Number(coverEndDateYear)),
    });

    return moment(coverEndDate).format('D MMM YYYY');
  }

  return undefined;
};

module.exports = mapCoverEndDate;
