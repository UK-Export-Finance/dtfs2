/*
populates with Forecast Year based on when the deal was issued -
31 March YYYY -  Issued 1 Jan - 31 Mar YYYY
30 June YYYY - Issued 1 April - 30 June YYYY
30 September YYYY - 1 July - 31 Aug YYYY
31 December YYYY - 1 Oct - 31 Dec YYYY
*/

const { getYearAndMmdd } = require('../../../helpers/date');

const getNextQuarterDate = (issuedDate) => {
  const { mmdd, year } = getYearAndMmdd(issuedDate);

  if (mmdd <= '03-31') {
    return `${year}-03-31`;
  }

  if (mmdd <= '06-30') {
    return `${year}-06-30`;
  }

  if (mmdd <= '09-30') {
    return `${year}-09-30`;
  }

  return `${year}-12-31`;
};

module.exports = getNextQuarterDate;
