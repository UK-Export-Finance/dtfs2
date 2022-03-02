const moment = require('moment');
const { hasValue } = require('../../../../utils/string');
const { formatYear } = require('../../../../utils/date');

const mapCoverEndDate = (day, month, year) => {
  // checks if valid date - not valid if coverEndDate is not set
  if (Number.isNaN(Number(day)) || Number.isNaN(Number(month)) || Number.isNaN(Number(year))) {
    return undefined;
  }
  const hasCoverEndDate = (hasValue(day)
    && hasValue(month)
    && hasValue(year));

  if (hasCoverEndDate) {
    const coverEndDate = moment().set({
      date: Number(day),
      month: Number(month) - 1, // months are zero indexed
      year: formatYear(Number(year)),
    });

    return moment(coverEndDate).format('D MMMM YYYY');
  }

  return undefined;
};

module.exports = mapCoverEndDate;
