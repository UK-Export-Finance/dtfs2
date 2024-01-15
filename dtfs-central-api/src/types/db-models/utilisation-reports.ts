import { WithId } from 'mongodb';
import { AzureFileInfo } from '../azure-file-info';
import { UtilisationReportReconciliationStatus, ReportPeriod } from '../utilisation-reports';
import { SessionBank } from '../session-bank';
import { Prettify } from '../types-helper';

export type UploadedByUserDetails = {
  id: string;
  firstname: string;
  surname: string;
};

export type UtilisationReport = Prettify<
  WithId<{
    /**
     * Details of the bank the report was uploaded for
     */
    bank: SessionBank;
    /**
     * Start and end dates of the report period.
     * @example
     * { start: { month: 1, year: 2023 }, end: { month: 1, year: 2023 } }
     */
    reportPeriod: ReportPeriod;
    /**
     * The date and time that the report was originally uploaded
     */
    dateUploaded: Date;
    /**
     * Metadata about the file uploaded to Azure Storage
     */
    azureFileInfo: AzureFileInfo | null;
    /**
     * Status code representing reconciliation progress of the report
     */
    status: UtilisationReportReconciliationStatus;
    /**
     * Details of the user that uploaded the report
     */
    uploadedBy: UploadedByUserDetails;
  }>
>;
