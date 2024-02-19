import { WithId } from 'mongodb';

export type BankReportPeriodSchedule = {
  startMonth: number;
  endMonth: number;
}[];

export type Bank = WithId<{
  id: string;
  name: string;
  mga: string[];
  emails: string[];
  companiesHouseNo: string;
  partyUrn: string;
  hasGefAccessOnly: boolean;
  paymentOfficerTeam: {
    teamName: string;
    email: string;
  };
  utilisationReportPeriodSchedule: BankReportPeriodSchedule;
  isVisibleInTfmUtilisationReports: boolean;
}>;
