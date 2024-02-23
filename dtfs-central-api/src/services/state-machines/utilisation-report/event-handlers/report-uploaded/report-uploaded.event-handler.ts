import { DbRequestSource, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';
import { AzureFileInfo } from '../../../../../types/azure-file-info.ts';
import { UtilisationReportRawCsvData } from '../../../../../types/utilisation-reports.ts';

type ReportUploadedEventPayload = {
  azureFileInfo: AzureFileInfo;
  reportCsvData: UtilisationReportRawCsvData[];
  uploadedByUserId: string;
  requestSource: DbRequestSource;
};

export type UtilisationReportReportUploadedEvent = BaseUtilisationReportEvent<'REPORT_UPLOADED', ReportUploadedEventPayload>;

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
