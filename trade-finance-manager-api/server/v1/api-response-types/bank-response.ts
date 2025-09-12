import { BankReportPeriodSchedule } from '@ukef/dtfs2-common';

type PaymentOfficerTeam = {
  teamName: string;
  emails: string[];
};

export type BankResponseBody = {
  _id: string;
  id: string;
  name: string;
  mga: string[];
  emails: string[];
  companiesHouseNo: string;
  partyUrn: string;
  hasGefAccessOnly: boolean;
  paymentOfficerTeam: PaymentOfficerTeam;
  utilisationReportPeriodSchedule: BankReportPeriodSchedule;
  isVisibleInTfmUtilisationReports: boolean;
};

export type BankWithReportingYearsResponseBody = BankResponseBody & {
  reportingYears: number[];
};
