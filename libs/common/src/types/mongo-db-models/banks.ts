import { WithId } from 'mongodb';
import { BankReportPeriodSchedule } from '../bank-report-period-schedule';

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
