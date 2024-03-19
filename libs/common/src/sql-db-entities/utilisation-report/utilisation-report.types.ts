import { ReportPeriodPartialEntity } from '../partial-entities';
import { DbRequestSourceParam } from '../helpers';
import { AzureFileInfoEntity } from '../azure-file-info';
import { UtilisationDataEntity } from '../utilisation-data';
import { UtilisationReportReconciliationStatus } from '../..';

export type CreateNotReceivedUtilisationReportEntityParams = DbRequestSourceParam & {
  bankId: string;
  reportPeriod: ReportPeriodPartialEntity;
};

export type UpdateWithUploadDetailsParams = DbRequestSourceParam & {
  azureFileInfo: AzureFileInfoEntity;
  data: UtilisationDataEntity[];
  uploadedByUserId: string;
};

export type UpdateWithStatusParams = DbRequestSourceParam & {
  status: UtilisationReportReconciliationStatus;
};
