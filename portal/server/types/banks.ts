type ReportPeriodSchedule = {
  startMonth: number;
  endMonth: number;
}

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
    email: string;
  };
  utilisationReportPeriodSchedule: ReportPeriodSchedule[];
  isVisibleInTfmUtilisationReports: boolean;
};

export type SessionBank = Pick<Bank, 'id' | 'name'>;