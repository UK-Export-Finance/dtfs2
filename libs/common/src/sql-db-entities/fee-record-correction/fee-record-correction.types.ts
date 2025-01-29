import { RecordCorrectionReason, RequestedByUser, RecordCorrectionValues } from '../../types';
import { FeeRecordEntity } from '../fee-record/fee-record.entity';
import { DbRequestSource } from '../helpers';

export type CreateFeeRecordCorrectionParams = {
  feeRecord: FeeRecordEntity;
  requestedByUser: RequestedByUser;
  reasons: RecordCorrectionReason[];
  additionalInfo: string;
  requestSource: DbRequestSource;
  bankTeamName: string;
  bankTeamEmails: string;
};

export type CompleteCorrectionParams = {
  previousValues: RecordCorrectionValues;
  correctedValues: RecordCorrectionValues;
  bankCommentary: string | null;
  requestSource: DbRequestSource;
};
