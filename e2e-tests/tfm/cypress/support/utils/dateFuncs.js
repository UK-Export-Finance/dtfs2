const padDate = (dayOrMonth) => String(dayOrMonth).padStart(2, 0);

const nowPlusDays = (numberDays) => {
  const date = new Date();
  date.setDate(date.getDate() + numberDays);
  return date;
};

const nowPlusMonths = (numberMonths) => {
  const date = new Date();
  date.setMonth(date.getMonth() + numberMonths);
  return date;
};

const getCurrentISOSubmissionMonth = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
  return `${currentDate.getFullYear()}-${formattedMonth}`;
};

/**
 * @param {string} submissionMonth - The submission month as an ISO month stamp
 * @returns {{ start: { month: number, year, number }, end: { month: number, year, number } }}
 */
const getMonthlyReportPeriodFromISOSubmissionMonth = (submissionMonth) => {
  const [year, month] = submissionMonth.split('-').map((x) => Number(x));
  const reportPeriodMonth = month === 1 ? 12 : month - 1;
  const reportPeriodYear = month === 1 ? year - 1 : year;
  return {
    start: {
      month: reportPeriodMonth,
      year: reportPeriodYear,
    },
    end: {
      month: reportPeriodMonth,
      year: reportPeriodYear,
    },
  };
};

module.exports = {
  padDate,
  nowPlusDays,
  nowPlusMonths,
  getCurrentISOSubmissionMonth,
  getMonthlyReportPeriodFromISOSubmissionMonth,
};
