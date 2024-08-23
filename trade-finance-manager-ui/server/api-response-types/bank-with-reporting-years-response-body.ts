import { Bank } from '../types/banks';

export type BankWithReportingYearsResponseBody = Bank & {
  reportingYears: number[];
};
