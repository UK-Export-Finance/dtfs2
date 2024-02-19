import { WithId } from 'mongodb';
import { Prettify } from '../types-helper';

type ReportPeriodSchedule = {
  startMonth: number;
  endMonth: number;
};

export type Bank = Prettify<
  WithId<{
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
  }>
>;
