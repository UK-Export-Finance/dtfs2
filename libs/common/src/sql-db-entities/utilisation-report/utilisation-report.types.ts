import { ReportPeriodPartialEntity } from '../partial-entities';
import { DbRequestSourceParam } from '../helpers';
import { AzureFileInfoEntity } from '../azure-file-info';
import { FeeRecordEntity } from '../fee-record';

export type CreateNotReceivedUtilisationReportEntityParams = DbRequestSourceParam & {
  bankId: string;
  reportPeriod: ReportPeriodPartialEntity;
};

export type UpdateWithUploadDetailsParams = DbRequestSourceParam & {
  azureFileInfo: AzureFileInfoEntity;
  feeRecords: FeeRecordEntity[];
  uploadedByUserId: string;
};
