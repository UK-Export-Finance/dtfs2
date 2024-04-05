import { OneIndexedMonth } from "./date";

type BankReportPeriodSchedule = {
  startMonth: OneIndexedMonth;
  endMonth: OneIndexedMonth;
}[];

export type Bank = {
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
  _id: string;
};
