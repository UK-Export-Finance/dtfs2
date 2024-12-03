import { ReportPeriodPartialEntity } from '../partial-entities';
import { DbRequestSourceParam } from '../helpers';
import { AzureFileInfoEntity } from '../azure-file-info';
import { UtilisationReportStatus } from '../../types';
import { FeeRecordEntity } from '../fee-record';

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
