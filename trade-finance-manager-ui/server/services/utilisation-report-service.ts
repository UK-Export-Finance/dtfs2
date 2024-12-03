import { IsoMonthStamp, asString } from '@ukef/dtfs2-common';
import { getBusinessDayOfMonth } from '../helpers/date';

export const getReportDueDate = (bankHolidays: Date[], submissionMonth: IsoMonthStamp): Date => {
  const businessDaysFromStartOfMonth = asString(
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH,
    'UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH',
  );
  const businessDay = parseInt(businessDaysFromStartOfMonth, 10);
  const dateInReportMonth = new Date(submissionMonth);
  return getBusinessDayOfMonth(dateInReportMonth, bankHolidays, businessDay);
};
