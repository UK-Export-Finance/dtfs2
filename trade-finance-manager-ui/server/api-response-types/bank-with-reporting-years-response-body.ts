import { Bank } from '@tfm-ui/types/banks';

export type BankWithReportingYearsResponseBody = Bank & {
  reportingYears: number[];
};
