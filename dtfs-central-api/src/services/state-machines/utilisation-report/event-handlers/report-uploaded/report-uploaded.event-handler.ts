import { DbRequestSource, UtilisationReportEntity, AzureFileInfo } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';
import { UtilisationReportRawCsvData } from '../../../../../types/utilisation-reports';

type ReportUploadedEventPayload = {
  azureFileInfo: AzureFileInfo;
  reportCsvData: UtilisationReportRawCsvData[];
  uploadedByUserId: string;
  requestSource: DbRequestSource;
};

export type UtilisationReportReportUploadedEvent = BaseUtilisationReportEvent<'REPORT_UPLOADED', ReportUploadedEventPayload>;
/**
 * Handler for the utilisation report "report uploaded" event
 * @param report - The report to update
 * @param param1 - The payload for the event
 * @returns The updated report
 */
export const handleUtilisationReportReportUploadedEvent = async (
  report: UtilisationReportEntity,
  { azureFileInfo, reportCsvData, uploadedByUserId, requestSource }: ReportUploadedEventPayload,
): Promise<UtilisationReportEntity> =>
  await UtilisationReportRepo.updateWithUploadDetails(report, {
    azureFileInfo,
    reportCsvData,
    uploadedByUserId,
    requestSource,
  });
