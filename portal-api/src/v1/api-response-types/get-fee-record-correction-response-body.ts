import { CurrencyAndAmount, RecordCorrectionReason } from '@ukef/dtfs2-common';

export type GetFeeRecordCorrectionResponseBody = {
  id: number;
  bankId: string;
  facilityId: string;
  exporter: string;
  reportedFees: CurrencyAndAmount;
  reasons: RecordCorrectionReason[];
  additionalInfo: string;
};
