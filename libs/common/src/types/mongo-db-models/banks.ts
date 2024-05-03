import { WithId } from 'mongodb';
import { BankReportPeriodSchedule } from '../bank-report-period-schedule';

export type PaymentOfficerTeam = {
  teamName: string;
  emails: string[];
};

export type Bank = WithId<{
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
}>;
