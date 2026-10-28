import { ReportPeriodPartialEntity } from '@ukef/sql-db-entities/partial-entities';
import { DbRequestSourceParam } from '@ukef/sql-db-entities/helpers';
import { AzureFileInfoEntity } from '@ukef/sql-db-entities/azure-file-info';
import { UtilisationReportStatus } from '@ukef/types';
import { FeeRecordEntity } from '@ukef/sql-db-entities/fee-record';

export type CreateNotReceivedUtilisationReportEntityParams = DbRequestSourceParam & {
  bankId: string;
  reportPeriod: ReportPeriodPartialEntity;
};

export type UpdateWithUploadDetailsParams = DbRequestSourceParam & {
  azureFileInfo: AzureFileInfoEntity;
  uploadedByUserId: string;
};

export type UpdateWithFeeRecordsParams = {
  feeRecords: FeeRecordEntity[];
};

export type UpdateWithStatusParams = DbRequestSourceParam & {
  status: UtilisationReportStatus;
};
