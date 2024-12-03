import { OneIndexedMonth } from './date';

export type BankReportPeriodSchedulePeriod = {
  startMonth: OneIndexedMonth;
  endMonth: OneIndexedMonth;
};

export type BankReportPeriodSchedule = BankReportPeriodSchedulePeriod[];
