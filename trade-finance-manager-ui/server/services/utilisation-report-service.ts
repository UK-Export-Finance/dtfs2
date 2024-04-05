import { subMonths } from 'date-fns';
import { IsoMonthStamp, MonthAndYear } from '@ukef/dtfs2-common';
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
  const reportPeriodDate = subMonths(new Date(submissionMonth), 1);
  return {
    month: getOneIndexedMonth(reportPeriodDate),
    year: reportPeriodDate.getFullYear(),
  };
};
