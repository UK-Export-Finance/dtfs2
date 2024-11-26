import { FeeRecordEntity } from '../fee-record/fee-record.entity';

type RequestedByUser = {
  id: string;
  firstName: string;
  lastName: string;
};

export type CreateFeeRecordCorrectionParams = {
  feeRecord: FeeRecordEntity;
  requestedByUser: RequestedByUser;
  reasons: string[];
  additionalInfo: string;
};
