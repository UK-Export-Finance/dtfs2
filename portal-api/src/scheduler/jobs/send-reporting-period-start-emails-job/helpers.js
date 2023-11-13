const { startOfMonth, format, subMonths } = require('date-fns');
const externalApi = require('../../../external-api/api');
const { addBusinessDaysWithHolidays } = require('../../../utils/date');

const getReportDueDate = async ({ businessDaysFromStartOfMonth }) => {
  const bankHolidays = await externalApi.bankHolidays.getBankHolidayDatesForRegion('england-and-wales');
  const reportDueDate = addBusinessDaysWithHolidays(startOfMonth(new Date()), businessDaysFromStartOfMonth, bankHolidays);
  return format(reportDueDate, 'do MMMM yyyy');
};

const getReportPeriod = () => {
  const lastMonth = subMonths(startOfMonth(new Date()), 1);
  return format(lastMonth, 'MMMM yyyy');
};

module.exports = { getReportDueDate, getReportPeriod };
