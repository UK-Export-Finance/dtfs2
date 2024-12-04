import { RecordCorrectionReason, RequestedByUser } from '../../types';
import { FeeRecordEntity } from '../fee-record/fee-record.entity';
import { DbRequestSource } from '../helpers';

export type CreateFeeRecordCorrectionParams = {
  feeRecord: FeeRecordEntity;
  requestedByUser: RequestedByUser;
  reasons: RecordCorrectionReason[];
  additionalInfo: string;
  requestSource: DbRequestSource;
};
