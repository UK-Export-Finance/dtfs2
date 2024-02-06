import { subMonths } from 'date-fns';
import { IsoMonthStamp, MonthAndYear } from '../types/date';
import { getBusinessDayOfMonth, getOneIndexedMonth } from '../helpers/date';
import { asString } from '../helpers/validation';

export const getReportDueDate = (bankHolidays: Date[], submissionMonth: IsoMonthStamp): Date => {
  const businessDaysFromStartOfMonth = asString(
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH,
    'UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH',
  );
  const businessDay = parseInt(businessDaysFromStartOfMonth, 10);
  const dateInReportMonth = new Date(submissionMonth);
  return getBusinessDayOfMonth(dateInReportMonth, bankHolidays, businessDay);
};

export const getReportPeriodStart = (submissionMonth: IsoMonthStamp): MonthAndYear => {
  // TODO FN-1456 - calculate report period start month based on bank's report period schedule
  const reportPeriodDate = subMonths(new Date(submissionMonth), 1);
  return {
    month: getOneIndexedMonth(reportPeriodDate),
    year: reportPeriodDate.getFullYear(),
  };
};
