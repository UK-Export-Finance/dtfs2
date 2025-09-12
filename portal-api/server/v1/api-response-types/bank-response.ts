import { BankReportPeriodSchedule, PaymentOfficerTeam } from '@ukef/dtfs2-common';

export type BankResponse = {
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
