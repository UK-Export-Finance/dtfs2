import { OneIndexedMonth } from './date';

export type BankReportPeriodSchedule = {
  startMonth: OneIndexedMonth;
  endMonth: OneIndexedMonth;
}[];
