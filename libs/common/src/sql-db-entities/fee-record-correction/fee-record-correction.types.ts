import { RecordCorrectionReason, RequestedByUser, RecordCorrectionValues } from '@ukef/types';
import { FeeRecordEntity } from '@ukef/sql-db-entities/fee-record/fee-record.entity';
import { DbRequestSource } from '@ukef/sql-db-entities/helpers';

export type CreateFeeRecordCorrectionParams = {
  feeRecord: FeeRecordEntity;
  requestedByUser: RequestedByUser;
  reasons: RecordCorrectionReason[];
  additionalInfo: string;
  requestSource: DbRequestSource;
  bankTeamName: string;
  bankTeamEmails: string[];
};

export type CompleteCorrectionParams = {
  previousValues: RecordCorrectionValues;
  correctedValues: RecordCorrectionValues;
  bankCommentary: string | null;
  requestSource: DbRequestSource;
};
