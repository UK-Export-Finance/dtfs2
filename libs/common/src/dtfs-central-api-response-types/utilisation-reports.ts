import { ReportPeriod, IsoDateTimeStamp, AzureFileInfo, UtilisationReportEntity, Prettify } from '..';

export type UtilisationReportResponseBody = Prettify<
  Pick<UtilisationReportEntity, 'id' | 'bankId' | 'status' | 'uploadedByUserId'> & {
    reportPeriod: ReportPeriod;
    azureFileInfo: AzureFileInfo | null;
    dateUploaded: IsoDateTimeStamp;
  }
>;
