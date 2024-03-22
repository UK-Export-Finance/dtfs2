import { UtilisationReportResponseBody } from './utilisation-report-response-body';

export type PreviousUtilisationReportsResponseBody = {
  year: number;
  reports: UtilisationReportResponseBody[];
}[];
