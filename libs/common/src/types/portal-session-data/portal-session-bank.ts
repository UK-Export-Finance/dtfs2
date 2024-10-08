import { BankReportPeriodSchedule } from '../bank-report-period-schedule';

export type PortalSessionBank = {
  _id: string;
  id: string;
  name: string;
  mga: string[];
  emails: string[];
  companiesHouseNo: string;
  partyUrn: string;
  hasGefAccessOnly: boolean;
  paymentOfficerTeam: {
    teamName: string;
    emails: string[];
  };
  utilisationReportPeriodSchedule: BankReportPeriodSchedule;
  isVisibleInTfmUtilisationReports: boolean;
};
