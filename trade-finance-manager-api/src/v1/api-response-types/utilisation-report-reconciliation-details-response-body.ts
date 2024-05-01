import { IsoDateTimeStamp, ReportPeriod, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';

export type UtilisationReportReconciliationDetailsResponseBody = {
  reportId: number;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  reportPeriod: ReportPeriod;
  dateUploaded: IsoDateTimeStamp;
  feeRecords: {
    facilityId: string;
  }[];
};
